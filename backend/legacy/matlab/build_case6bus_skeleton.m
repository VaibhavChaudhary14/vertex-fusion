function build_case6bus_skeleton()
% BUILD_CASE6BUS_SKELETON  Place Simulink blocks for 6-bus network skeleton.
% After running, open model 'sixbus_sim' and connect three-phase lines manually.

mdl = 'sixbus_sim';
if bdIsLoaded(mdl)
    close_system(mdl, 0);
end
new_system(mdl);
open_system(mdl);

% Add Powergui
add_block('powerlib/Elements/Powergui', [mdl '/Powergui'], 'Position',[20 20 120 70]);

% Add 3-phase sources for Bus1 and Bus2
add_block('powerlib/Sources/Three-Phase Source', [mdl '/Source_Bus1'], 'Position',[150 50 220 120]);
set_param([mdl '/Source_Bus1'], 'Amplitude', '132000', 'Frequency','50','Phase','0');

add_block('powerlib/Sources/Three-Phase Source', [mdl '/Source_Bus2'], 'Position',[150 220 220 290]);
set_param([mdl '/Source_Bus2'], 'Amplitude', '132000', 'Frequency','50','Phase','0');

% Add 6 bus VI Measurement blocks (use as bus nodes)
ypos = [30 200 370 100 270 440];
for i=1:6
    blk = sprintf('%s/Bus%d_Node', mdl, i);
    add_block('powerlib/Measurements/Three-Phase V-I Measurement', blk, 'Position',[320 ypos(i) 360 ypos(i)+40]);
end

% Add Series R-L branches for 7 lines (user will connect)
lineNames = {'Line1_1_6','Line2_1_4','Line3_4_6','Line4_6_5','Line5_5_2','Line6_2_3','Line7_4_3'};
xpos = [460 460 460 460 460 460 460];
ypos2 = [10 90 170 250 330 410 500];
for k=1:length(lineNames)
    add_block('powerlib/Elements/Three-Phase Series RLC Branch', [mdl '/' lineNames{k}],...
        'Position',[xpos(k) ypos2(k) xpos(k)+120 ypos2(k)+50]);
    % set RL type; set default small R so numerically stable; user will edit values
    set_param([mdl '/' lineNames{k}], 'BranchType','RL','Resistance','1e-6','Inductance','0.001');
end

% Add three-phase constant power loads at buses 3,5,6
add_block('powerlib/Elements/Three-Phase Parallel RLC Load', [mdl '/Load_Bus3'], 'Position',[680 350 740 410]);
add_block('powerlib/Elements/Three-Phase Parallel RLC Load', [mdl '/Load_Bus5'], 'Position',[680 230 740 290]);
add_block('powerlib/Elements/Three-Phase Parallel RLC Load', [mdl '/Load_Bus6'], 'Position',[680 470 740 530]);

% Add Interpreted MATLAB Function block that calls update_pf()
add_block('simulink/User-Defined Functions/Interpreted MATLAB Function', [mdl '/get_pf'], 'Position',[150 400 250 460]);
set_param([mdl '/get_pf'], 'FunctionName', 'update_pf');

% Add Scope and Displays
add_block('simulink/Sinks/Display', [mdl '/V_display'], 'Position',[910 400 970 430]);
add_block('simulink/Sinks/Display', [mdl '/ang_display'], 'Position',[910 460 970 490]);

% Save and open model
save_system(mdl);
open_system(mdl);
disp('Model skeleton created. Connect three-phase ports manually and set component parameters per the instructions.');
end
