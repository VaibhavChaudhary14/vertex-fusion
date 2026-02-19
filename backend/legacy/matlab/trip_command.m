% Total simulation time (must match your Simulink StopTime)
Tend = 5;   % you can change this if StopTime is different

% Time vector for trip signal
t = linspace(0, Tend, 1001)';   % 1001 samples between 0 and Tend

% Time when breaker should open (in seconds)
TripTime = 2.0;

% TripFlag: 0 before TripTime, 1 after TripTime
TripFlag = double(t >= TripTime);

% Build timeseries for From Workspace block
TripSignal = timeseries(TripFlag, t);

% Optional: visualize
figure;
plot(TripSignal.Time, TripSignal.Data, 'LineWidth', 1.5);
xlabel('Time (s)');
ylabel('TripFlag (0=CLOSED, 1=OPEN)');
title('Breaker Trip Command Signal');
grid on;
