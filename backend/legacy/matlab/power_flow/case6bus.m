function mpc = case6bus
% CASE6BUS - IEEE 6-bus, 7-line test system (100 MVA base)
% Compatible with MATPOWER v7.0+

mpc.version = '2';
mpc.baseMVA = 100;

%% Bus data
% bus_i type Pd Qd Gs Bs area Vm Va baseKV zone Vmax Vmin
mpc.bus = [
    1   3   0.000  0.000  0  0  1  1.00  0    132   1  1.10  0.90;
    2   2   0.000  0.000  0  0  1  1.00  0    132   1  1.10  0.90;
    3   1   0.275  0.065  0  0  1  1.00  0    132   1  1.10  0.90;
    4   1   0.000  0.000  0  0  1  1.00  0    132   1  1.10  0.90;
    5   1   0.150  0.090  0  0  1  1.00  0    132   1  1.10  0.90;
    6   1   0.250  0.005  0  0  1  1.00  0    132   1  1.10  0.90;
];

%% Generator data
% bus Pg Qg Qmax Qmin Vg mBase status Pmax Pmin
mpc.gen = [
    1  0.450  0.060  2.0  -2.0  1.00  100  1  10  0;
    2  0.500  0.200  2.0  -2.0  1.00  100  1  10  0;
];

%% Branch data
% fbus tbus r x b rateA rateB rateC ratio angle status
mpc.branch = [
  1  6  0.1230  0.5180  0.0  3.00 0 0 1.0 0 1;
  1  4  0.0800  0.3700  0.0  3.00 0 0 1.0 0 1;
  4  6  0.0970  0.4070  0.0  3.00 0 0 1.0 0 1;
  6  5  0.0000  0.3000  0.0  1.00 0 0 1.0 0 1;
  5  2  0.2820  0.6400  0.0  2.50 0 0 1.0 0 1;
  2  3  0.7230  1.0500  0.0  1.50 0 0 1.0 0 1;
  4  3  0.0000  0.1330  0.0  2.50 0 0 1.0 0 1;
];

%% generator cost data
% 2 startup shutdown n c2 c1 c0
mpc.gencost = [
    2   0   0   3   0.01   40   0;  % generator at bus 1
    2   0   0   3   0.01   20   0;  % generator at bus 2
];


end
