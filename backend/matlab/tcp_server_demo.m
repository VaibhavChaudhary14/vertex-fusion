% Vertex Fusion - MATLAB Real-Time SCADA Server
% Connects Simscape Simulation to Python AI Backend
% Run this script AFTER opening the IEEE 9-Bus Simulink Model

% Configuration
HOST = "127.0.0.1";
PORT = 5000;
SAMPLE_TIME = 0.05; % 20Hz

disp(['Starting TCP Server on ' HOST ':' num2str(PORT) '...']);
server = tcpserver(HOST, PORT, "ConnectionChangedFcn", @connectionFcn);

% Main Loop (Run while simulation is active)
% Assumes 'simOut' structure or direct workspace access from Simulink
% Note: For true real-time, use a Timer or Function Block in Simulink.
% This loop is a mock for the "Run in Console" approach.

disp('Waiting for Python Client...');
while true
    if server.Connected
        % 1. Read Grid State from Workspace (Updated by Simulink)
        % Ensure your Simulink model exports 'BusVoltages', 'LineCurrents' to workspace
        % Example: BusVoltages = [1.01 0.99 1.02 ... 9 buses]
        
        try
            % Placeholder: Generate dummy 9-bus data if simulation not running
            t = now;
            V = 1.0 + 0.05 * randn(1, 9);   % 9 Bus Voltages
            I = 0.5 + 0.1 * randn(1, 9);    % 9 Line Currents
            P = 100 + 10 * randn(1, 9);     % 9 Active Powers
            Q = 20 + 5 * randn(1, 9);       % 9 Reactive Powers
            Freq = 60 + 0.1 * randn(1, 1);  % System Frequency
            
            % Construct Packet: [Header, Data...]
            data = [t, Freq, V, I, P, Q]; 
            % Size: 1 + 1 + 9 + 9 + 9 + 9 = 38 floats
            
            % 2. Send Data to Python
            write(server, data, "double");
            
            % 3. Check for Commands (Trip/Close) from Python
            if server.NumBytesAvailable > 0
                cmd = read(server, server.NumBytesAvailable, "string");
                disp(['Received Command: ' cmd]);
                
                % Process Command
                if contains(cmd, "TRIP_LINE_")
                    line_idx = extractAfter(cmd, "TRIP_LINE_");
                    % set_param(['IEEE9/Breaker' line_idx], 'SwitchState', 'open');
                    disp(['Executing: Trip Breaker ' line_idx]);
                elseif contains(cmd, "CLOSE_LINE_")
                     line_idx = extractAfter(cmd, "CLOSE_LINE_");
                     % set_param(['IEEE9/Breaker' line_idx], 'SwitchState', 'closed');
                     disp(['Executing: Close Breaker ' line_idx]);
                end
            end
            
        catch ME
            disp(['Error in Loop: ' ME.message]);
        end
    end
    pause(SAMPLE_TIME);
end

function connectionFcn(src, ~)
    if src.Connected
        disp('Client Connected!');
    else
        disp('Client Disconnected.');
    end
end
