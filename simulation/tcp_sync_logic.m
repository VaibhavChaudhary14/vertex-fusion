function breaker_cmd = tcp_sync_logic(u)
% Vertex Fusion TCP Sync Logic (Simulink Coder Optimized)
% This function sends 54 IEEE 9-bus features to Python AI Hub.

% 1. Declare extrinsic and persistent variables at the TOP-LEVEL
coder.extrinsic('tcpclient', 'write', 'read', 'isempty', 'strcmp');
persistent tcp_client;

% 2. Pre-initialize output as a double scalar (Crucial for Coder)
breaker_cmd = 1.0; 

% 3. Handle 54-feature vector safety check
if length(u) ~= 54
    return;
end

% 4. Extrinsic logic for Simulation/Interpretation
if coder.target('MATLAB')
    % Lazy connect
    if isempty(tcp_client)
        try
            tcp_client = tcpclient('127.0.0.1', 5000, 'Timeout', 0.1);
        catch
            % If server is unreachable, we keep breaker_cmd = 1
            return;
        end
    end
    
    % Communication logic
    if ~isempty(tcp_client)
        % Send features
        write(tcp_client, u, 'double');
        
        % Check for mitigation command (4 bytes: 'TRIP' or 'NORM')
        if tcp_client.NumBytesAvailable >= 4
            % Read exactly 4 chars
            cmd_raw = read(tcp_client, 4, 'char');
            
            % Use strcmp (extrinsic) for safe comparison
            if strcmp(cmd_raw, 'TRIP')
                breaker_cmd = 0.0;
            else
                breaker_cmd = 1.0;
            end
        end
    end
end

end
