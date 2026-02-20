function run_wrapper()
    % RUN_WRAPPER  Bridge between Python and MATLAB
    % Reads 'input_params.json', runs power flow, writes 'output_results.json'

    try
        % 1. Read Inputs
        if exist('input_params.json', 'file')
            fid = fopen('input_params.json', 'r');
            raw = fread(fid, inf);
            str = char(raw');
            fclose(fid);
            inputs = jsondecode(str);
        else
            % Default values if file missing (for testing)
            inputs = struct('load_factor', 1.0, 'trip_line', "");
        end

        % 2. Setup Case
        % Ensure case6bus is accessible
        if exist('case6bus', 'file') ~= 2
            error('case6bus.m not found on path.');
        end
        
        mpc = case6bus();
        
        % Apply Load Factor
        if isfield(inputs, 'load_factor')
            mpc.bus(:, 3) = mpc.bus(:, 3) * inputs.load_factor; % Pd
            mpc.bus(:, 4) = mpc.bus(:, 4) * inputs.load_factor; % Qd
        end
        
        % Apply Breaker Trip
        % Mapping line names to indices (1-based for MATLAB)
        % This is a simple example mapping; adjust to match Python's logic
        if isfield(inputs, 'trip_line') && strlength(inputs.trip_line) > 0
             % Example: "Line 1-2" -> Index 1
             % For now, we just log it, actual topology change logic depends on mpc struct
             % mpc.branch(idx, 11) = 0; % status = 0 (out of service)
        end
        
        % 3. Run Power Flow
        results = runpf(mpc, mpoption('verbose', 0, 'out.all', 0));
        
        % 4. Format Outputs
        output = struct();
        output.success = results.success;
        output.timestamp = char(datetime('now'));
        
        % Buses
        % Columns: 8=Vm, 9=Va, 3=Pd, 4=Qd
        output.buses = struct();
        output.buses.Vm = results.bus(:, 8);
        output.buses.Va = results.bus(:, 9);
        output.buses.Pd = results.bus(:, 3);
        
        % Lines
        % Columns: 14=P_from, 16=Q_from
        output.lines = struct();
        output.lines.P_from = results.branch(:, 14);
        
        % 5. Write Outputs
        jsonStr = jsonencode(output);
        fid = fopen('output_results.json', 'w');
        fwrite(fid, jsonStr, 'char');
        fclose(fid);
        
    catch ME
        % Write error to file so Python knows
        err = struct('error', ME.message);
        fid = fopen('output_results.json', 'w');
        fwrite(fid, jsonencode(err), 'char');
        fclose(fid);
        rethrow(ME);
    end
end
