function breaker_cmds = tcp_sync_logic(u)
% Vertex Fusion Granular TCP Sync (18-Breaker Substation Grade)

% 1. Declare extrinsic and persistent variables
coder.extrinsic('tcpclient', 'write', 'read', 'isempty', 'strcmp', 'split', 'contains');
persistent tcp_client;
persistent states;

% 2. Initialize 18 breaker states (0=Closed, 1=Open)
breaker_cmds = zeros(18, 1); %#codegen (Force size for Simulink)

if isempty(states)
    states = zeros(18, 1);
end

% Fill preallocated memory to satisfy lint and coder
breaker_cmds(:) = states; 

% 3. Guard for 54-feature vector
if length(u) ~= 54
    return;
end

% 4. Real-time Communication Logic
if coder.target('MATLAB')
    if isempty(tcp_client)
        try
            tcp_client = tcpclient('127.0.0.1', 5000, 'Timeout', 0.05); % Match SCADA port
        catch
            return;
        end
    end
    
    if ~isempty(tcp_client)
        % Send telemetry [9 buses x 6 features]
        write(tcp_client, u, 'double');
        
        % Read command (Variable length, e.g., "TRIP L4-5_B4")
        if tcp_client.NumBytesAvailable > 0
            raw_data = read(tcp_client, tcp_client.NumBytesAvailable, 'char');
            cmd = char(raw_data');
            
            % Simple persistent state management for 18 breakers
            % Mapping strategy matches your specific MATLAB topology:
            % 1:L1-4_B1, 2:L1-4_B4, 3:L2-7_B2, 4:L2-7_B7, 5:L3-9_B3, 6:L3-9_B9
            % 7:L4-5_B4, 8:L4-5_B5, 9:L4-6_B4, 10:L4-6_B6
            % 11:L5-7_B5, 12:L5-7_B7, 13:L6-9_B6, 14:L6-9_B9
            % 15:L7-8_B7, 16:L7-8_B8, 17:L8-9_B8, 18:L8-9_B9
            
            targets = {'L1-4_B1', 'L1-4_B4', 'L2-7_B2', 'L2-7_B7', 'L3-9_B3', 'L3-9_B9', ...
                       'L4-5_B4', 'L4-5_B5', 'L4-6_B4', 'L4-6_B6', 'L5-7_B5', 'L5-7_B7', ...
                       'L6-9_B6', 'L6-9_B9', 'L7-8_B7', 'L7-8_B8', 'L8-9_B8', 'L8-9_B9'};
            
            for i = 1:length(targets)
                if contains(cmd, targets{i})
                    if contains(cmd, 'TRIP')
                        states(i) = 1.0; % OPEN
                    elseif contains(cmd, 'CLOSE')
                        states(i) = 0.0; % CLOSED
                    end
                end
            end
            
            % Global Reset
            if contains(cmd, 'NORM')
                states = zeros(18, 1);
            end
        end
    end
end

breaker_cmds = states;
end
