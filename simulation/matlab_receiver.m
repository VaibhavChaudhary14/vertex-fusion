% matlab_receiver.m
% Background listener for Bi-Directional SCADA Platform
% Receives Attack Injection commands from the Python Dashboard

server = tcpserver("127.0.0.1", 6000);
disp("Waiting for attack commands from Python Dashboard...");

% Ensure base variables exist so Simulink doesn't crash on start
assignin('base', 'attack_bus', -1);
assignin('base', 'attack_feature', 0);
assignin('base', 'attack_magnitude', 0);

while true
    if server.NumBytesAvailable > 0
        data = read(server, server.NumBytesAvailable, "string");
        disp("Received Command: " + data);
        
        parts = split(data, ",");
        
        if parts(1) == "ATTACK"
            bus = str2double(parts(2));
            feature = str2double(parts(3));
            magnitude = str2double(parts(4));
            
            % Update Simulink workspace variables live
            assignin('base', 'attack_bus', bus);
            assignin('base', 'attack_feature', feature);
            assignin('base', 'attack_magnitude', magnitude);
            
            disp("Attack successfully injected into MATLAB workspace.");
        end
    end
    pause(0.1);
end
