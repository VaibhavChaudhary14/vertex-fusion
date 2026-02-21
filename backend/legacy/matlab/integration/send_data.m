function send_data(V, I, P, Q, F, BreakerStatus)
    %SEND_DATA Streams power system measurements to Python AI via TCP/IP
    %   Inputs:
    %       V: Voltage magnitudes [9x1] (p.u.)
    %       I: Current magnitudes [9x1] (p.u.)
    %       P: Active Power [9x1] (MW)
    %       Q: Reactive Power [9x1] (MVar)
    %       F: Frequency [9x1] (Hz)
    %       BreakerStatus: Status of breakers [Nx1] (1=Closed, 0=Open)
    
    % Persistent variables to maintain state across time steps
    persistent server
    persistent step_count
    
    if isempty(step_count)
        step_count = 0;
    end
    step_count = step_count + 1;
    
    % Decimation: Only send every 10th step (assuming 0.01s step -> 0.1s update)
    % Adjust '10' based on your actual sampling rate requirements
    if mod(step_count, 10) ~= 0
        return; 
    end

    % Initialize TCP Server on Port 5000
    if isempty(server)
        try
            % Create server listening on localhost:5000
            % Note: tcpserver requires Instrument Control Toolbox or recent MATLAB versions
            server = tcpserver("127.0.0.1", 5000, "ConnectionChangedFcn", @connectionFcn);
            disp('✅ TCP Server started on port 5000');
        catch ME
            disp(['❌ Failed to start TCP Server: ' ME.message]);
        end
    end
    
    % Ensure server is valid
    if isempty(server) || ~isvalid(server)
        return;
    end

    % Construct Data Packet
    % Format: [Timestamp, V(1..9), I(1..9), P(1..9), Q(1..9), F(1..9), BreakerStatus]
    % Flatten all arrays to row vectors
    timestamp = now; 
    packet = [timestamp, V(:)', I(:)', P(:)', Q(:)', F(:)', BreakerStatus(:)'];
    
    % Send Data if Client is Connected
    if server.Connected
        try
            write(server, packet, "double");
        catch
            % Ignore write errors (client might have disconnected)
        end
        
        % Check for Incoming Commands (e.g., TRIP_LINE_X)
        if server.NumBytesAvailable > 0
            try
                cmd = read(server, server.NumBytesAvailable, "string");
                disp(['📩 Received Command: ' cmd]);
                
                % Parse Command
                if startsWith(cmd, "TRIP_LINE_")
                    line_id = extractAfter(cmd, "TRIP_LINE_");
                    
                    % Example: Map ID to Block Path
                    % You must update these paths to match your Simulink model structure
                    block_path = ['IEEE9/Breaker_Line_' line_id];
                    
                    try
                        set_param(block_path, 'SwitchState', 'open');
                        disp(['⚠️ TRIP EXECUTED: ' block_path]);
                    catch ME
                        disp(['❌ Failed to trip breaker: ' ME.message]);
                    end
                end
            catch
                disp('❌ Error reading command');
            end
        end
    end
end

function connectionFcn(src, ~)
    if src.Connected
        disp('🔌 Python Client Connected');
    else
        disp('🔌 Python Client Disconnected');
    end
end
