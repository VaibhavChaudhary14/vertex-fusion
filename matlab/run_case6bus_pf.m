% run_case6bus_pf.m
mpc = case6bus;
results = runpf(mpc);

V = results.bus(:,8);
ang = results.bus(:,9);

save('pf_results.mat', 'V', 'ang');
