% matlab_client.m
% Unified Bidirectional Client for IEEE 9-Bus + Cyber-Physical Platform - Multi-Attack Version
clc; clear;

HOST = "127.0.0.1";
PORT_SEND = 5000;   % MATLAB -> Python (Telemetry)
PORT_RECV = 6000;   % Python -> MATLAB (Attack Commands)

% =============================
% STATE INITIALIZATION
% =============================
history_buffer = zeros(100, 54); % Rolling buffer for Replay Attacks
buf_idx = 1;

attack_type = "NONE";
attack_bus = 1;
attack_feat = 1;
attack_mag = 0.0;

% =============================
% CONNECT TO PYTHON SERVER
% =============================
disp("Cleaning up old connections...");
% Clean up any existing instances from workspace
try
    if exist('t', 'var'), clear t; end
    if exist('server', 'var'), clear server; end
catch
end

disp("Connecting to Python Hub (Telemetry)...");
try
    t = tcpclient(HOST, PORT_SEND, 'Timeout', 5);
catch
    error("❌ FAILED to connect to AI Engine. Is realtime_server.py running on Port 5000?");
end

% =============================
% START RECEIVER SERVER
% =============================
disp("Starting local Attack Command Receiver...");
try
    server = tcpserver(HOST, PORT_RECV);
catch
    disp("⚠ Server Port busy, attempting reset...");
    pause(1);
    server = tcpserver(HOST, PORT_RECV);
end

% Path Management
model_dir = '9 Bus Major';
if exist(fullfile(pwd, '..', model_dir), 'dir')
    addpath(fullfile(pwd, '..', model_dir));
elseif exist(model_dir, 'dir')
    addpath(model_dir);
end

model_name = 'nine_bus_main_model';
if ~exist(model_name, 'file') && ~exist([model_name '.slx'], 'file')
    error("❌ SIMULINK MODEL NOT FOUND: %s. slx or .mdl expected in path.", model_name);
end

disp("MATLAB Client Ready. Entering Unified Loop...");

while true
    try
        % =============================
        % 1. RUN SIMULATION STEP
        % =============================
        simOut = sim(model_name, 'StopTime', '0.02', 'SrcWorkspace', 'current');
        
        % Extract telemetry
        logs = simOut.logsout;
        data_raw = [];
        for k = 1:logs.numElements
            elem = logs.getElement(k);
            if isa(elem.Values, 'timeseries')
                val = elem.Values.Data(end, :);
                data_raw = [data_raw val];
            end
        end
        
        % Ensure exactly 54 features
        if length(data_raw) < 54
            data_raw = [data_raw zeros(1, 54 - length(data_raw))]; 
        elseif length(data_raw) > 54
            data_raw = data_raw(1:54);
        end
        
        data_to_send = data_raw;

        % =============================
        % 2. APPLY ATTACK MANIPULATION
        % =============================
        if attack_type ~= "NONE"
            % Map Bus/Feat to Index (1-indexed for MATLAB)
            % Attack Bus 1-9, Feat 0-5 (from backend) -> 1-6 for MATLAB
            feat_idx = (attack_bus - 1) * 6 + attack_feat;
            
            if feat_idx > 0 && feat_idx <= 54
                switch attack_type
                    case "FDI"
                        data_to_send(feat_idx) = data_raw(feat_idx) + attack_mag;
                        
                    case "DOS"
                        data_to_send(feat_idx) = 0;
                        
                    case "REPLAY"
                        % Buffer index management
                        replay_ptr = mod(buf_idx - 20 - 1, 100) + 1;
                        data_to_send(feat_idx) = history_buffer(replay_ptr, feat_idx);
                        
                    case "NOISE"
                        data_to_send(feat_idx) = data_raw(feat_idx) + (rand() - 0.5) * attack_mag;
                end
            end
        end

        % Update History Buffer
        history_buffer(buf_idx, :) = data_raw;
        buf_idx = mod(buf_idx, 100) + 1;

        % =============================
        % 3. TRANSMIT TELEMETRY
        % =============================
        msg = strjoin(string(data_to_send), ',');
        write(t, uint8([char(msg) 10])); % Add newline LF for Python's readline
        
        % =============================
        % 4. COMMAND LISTENER
        % =============================
        if server.Connected && server.NumBytesAvailable > 0
            cmd_raw = char(read(server, server.NumBytesAvailable, 'char'));
            parts = split(strtrim(cmd_raw), ",");
            
            if length(parts) >= 5 && strcmp(parts(1), "ATTACK")
                attack_type = string(parts(2));
                attack_bus = str2double(parts(3));
                attack_feat = str2double(parts(4)) + 1; % 0-idx to 1-idx
                attack_mag = str2double(parts(5));
                
                fprintf("⚡ Attack: [%s] Bus:%d Feat:%d Mag:%.2f\n", ...
                    attack_type, attack_bus, attack_feat, attack_mag);
            end
        end
        
    catch ME
        fprintf("⚠ Loop iteration warning: %s\n", ME.message);
    end
    
    pause(0.01); 
end
