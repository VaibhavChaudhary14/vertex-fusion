%% Vertex Fusion: IEEE 9-Bus Simulation Initialization
% This script prepares the MATLAB workspace and TCP connection for Vertex Fusion.

clear;
clc;

% --1. Network Parameters-- %
    The Python AI Hub listens on 127.0.0.1 : 5000 remoteHost = '127.0.0.1';
remotePort = 5000;

% --2. Global Socket Object-- global client;
fprintf('Connecting to Vertex Fusion Backend (%s:%d)...\n', remoteHost,
        remotePort);

try
    % For R2019b and later, use tcpclient. Ensure the 'Timeout' is sufficient for inference.
    client = tcpclient(remoteHost, remotePort, 'Timeout', 10);
fprintf('✅ Connected to Simulation Hub.\n');
catch ME fprintf('❌ Connection Failed: %s\n', ME.message);
error(
    'Ensure the Python backend is running via "python simulation/main.py" before starting MATLAB.');
end

    % --3. Simulation Parameters-- Ts = 0.01;
% Sample Time(s) V_Base = 230e3;
% 230 kV Base S_Base = 100e6;
% 100 MVA Base I_Base = S_Base / (sqrt(3) * V_Base);

fprintf(
    'System parameters calibrated. Load ieee9_vertex_fusion.slx to begin.\n');
    
