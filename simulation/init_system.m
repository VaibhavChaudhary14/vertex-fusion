%% Vertex Fusion: IEEE 9-Bus Simulation Initialization
% This script prepares the MATLAB workspace and TCP connection for Vertex Fusion.

clear;
clc;

% --1. Network Parameters--
% Vertex Fusion SCADA listens on 127.0.0.1 : 5000
remoteHost = '127.0.0.1';
remotePort = 5000;

% --2. Global Socket Object-- 
global client;
fprintf('Connecting to Vertex Fusion SCADA Hub (%s:%d)...\n', remoteHost, remotePort);

try
    % For R2019b and later, use tcpclient. Ensure the 'Timeout' is sufficient for inference.
    client = tcpclient(remoteHost, remotePort, 'Timeout', 10);
    fprintf('✅ Connected to Simulation Hub.\n');
catch ME
    fprintf('❌ Connection Failed: %s\n', ME.message);
    error('Ensure the Python backend is running via "python simulation/main.py" before starting MATLAB.');
end

% --3. Simulation Parameters--
Ts = 0.01;        % Sample Time(s)
V_Base = 230e3;    % 230 kV Base
S_Base = 100e6;    % 100 MVA Base
I_Base = S_Base / (sqrt(3) * V_Base);

% --4. Line Parameter Correction--
% If you see "Propagation speed > 300000 km/s", adjust Line L/C constants.
% Typical values for 230kV lines:
% R = 0.02 ohms/km, L = 0.8e-3 H/km, C = 15e-9 F/km
fprintf('System parameters calibrated. Load IEEE_9bus_new_o.slx to begin.\n');
