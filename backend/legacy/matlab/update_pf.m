function [V, ang] = update_pf()
% UPDATE_PF  Run MATPOWER power flow for case6bus and return voltages & angles
%   [V,ang] = update_pf() returns:
%     V   - 6x1 vector of bus voltage magnitudes (p.u.)
%     ang - 6x1 vector of bus voltage angles (degrees)

% Ensure MATPOWER is on the path (optional if you've already addpath'd)
% You can remove the next two lines if you already permanently added MATPOWER to path.
% addpath(genpath('D:\Software\matpower8.1\matpower8.1'));  % <-- adjust if needed

mpc = case6bus();          % your MATPOWER case function
results = runpf(mpc, mpoption('verbose', 0, 'out.all', 0));  % quiet run

V   = results.bus(:,8);    % V magnitude (p.u.)
ang = results.bus(:,9);    % voltage angle (deg)
end
