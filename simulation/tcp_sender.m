% tcp_sender.m
% Real-time SCADA integration script for IEEE 9-bus Simulink model

t = tcpclient("127.0.0.1", 5000);

disp("Connected to Python AI Server. Starting streaming...");

while true
    
    simOut = sim('nine_bus_main_model','StopTime','0.02');
    
    logs = simOut.logsout;
    data = [];
    
    for k = 1:logs.numElements
        elem = logs.getElement(k);
        
        if isa(elem.Values, 'timeseries')
            signal = elem.Values.Data(end,:); % latest value
            data = [data signal];
        end
    end
    
    % Convert to string
    msg = strjoin(string(data), ',');
    
    write(t, uint8(msg));
    
    pause(0.1); % simulate streaming
end
