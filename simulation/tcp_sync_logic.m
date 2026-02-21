function breaker_cmd =
    tcp_sync_logic(u) % Vertex Fusion TCP Sync Logic %
        This function sends 54 IEEE 9 -
    bus features to Python and receives a trip / norm command.% Inputs : u =
        54x1 double vector(IEEE 9 - bus state) % Output : breaker_cmd =
            1(Normal) or 0(Trip)

% -- Define Extrinsic Functions for Simulink --
coder.extrinsic('write', 'read', 'string', 'fprintf');

                             % --Define Persistent Socket-- global client;

% Initialize output to Normal(1) breaker_cmd = double(1);

% Ensure the vector is exactly 54 features if length (u) ~= 54 return;
end

    % --1. Transmit Data to Python-- %
    We send the vector as a raw double stream(432 bytes) if ~isempty(client)
        write(client, u, "double");
end

% -- 2. Receive Command (4 bytes) --
% We wait for exactly 4 characters (e.g., 'TRIP', 'NORM')
if ~isempty(client) && client.NumBytesAvailable >= 4
    raw = read(client, 4, "char");
cmd = string(raw);

if cmd
  == "TRIP" breaker_cmd = double(0);
elseif cmd == "NORM" || cmd == "ALRM" breaker_cmd = double(1);
end end

    end
