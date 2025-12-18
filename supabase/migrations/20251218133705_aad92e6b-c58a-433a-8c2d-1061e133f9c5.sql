-- Insert team members based on Excel data
-- Using efetivo matricula to link members to teams

-- ARMEIRO Teams members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '33007868-705a-4c94-8e71-7217ada2d427', id, 'ARMEIRO' FROM dim_efetivo WHERE matricula IN ('73943X', '0073943X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '03720239-204d-4472-9c1a-bab353afd268', id, 'ARMEIRO' FROM dim_efetivo WHERE matricula IN ('7368844', '07368844');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '2de972a4-9113-46b3-8463-20aecb439294', id, 'ARMEIRO' FROM dim_efetivo WHERE matricula IN ('7379536', '07379536');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b83cb96c-6536-4c1b-9077-d9e5ce0c459b', id, 'ARMEIRO' FROM dim_efetivo WHERE matricula IN ('73909X', '0073909X');

-- GOC ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'e8eab6c9-ac64-4344-8ffa-1a01c73db091', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('213985', '00213985');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'e8eab6c9-ac64-4344-8ffa-1a01c73db091', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('2151189', '02151189');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'e8eab6c9-ac64-4344-8ffa-1a01c73db091', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34283544');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'e8eab6c9-ac64-4344-8ffa-1a01c73db091', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7383738', '07383738');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'e8eab6c9-ac64-4344-8ffa-1a01c73db091', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34251271');

-- GOC BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('740195', '00740195');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7314051', '07314051');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7315910', '07315910');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7323589', '07323589');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7316771', '07316771');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7369964', '07369964');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34280464');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7339612', '07339612');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '73079b28-0853-4299-9027-b3f8299ae933', id, 'MOTORISTA' FROM dim_efetivo WHERE matricula IN ('7384033', '07384033');

-- GOC CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '58763984-5c17-45a0-a91b-3c8c96d484d1', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('230790', '00230790');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '58763984-5c17-45a0-a91b-3c8c96d484d1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('729396', '00729396');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '58763984-5c17-45a0-a91b-3c8c96d484d1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('728632', '00728632');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '58763984-5c17-45a0-a91b-3c8c96d484d1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7318138', '07318138');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '58763984-5c17-45a0-a91b-3c8c96d484d1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7316100', '07316100');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '58763984-5c17-45a0-a91b-3c8c96d484d1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7361173', '07361173');

-- GOC DELTA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8539f4e7-60bf-4b2e-a686-e27d29c1a5b8', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('7318960', '07318960');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8539f4e7-60bf-4b2e-a686-e27d29c1a5b8', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7318961', '07318961');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8539f4e7-60bf-4b2e-a686-e27d29c1a5b8', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('731471X', '0731471X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8539f4e7-60bf-4b2e-a686-e27d29c1a5b8', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7392834', '07392834');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8539f4e7-60bf-4b2e-a686-e27d29c1a5b8', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7339728', '07339728');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8539f4e7-60bf-4b2e-a686-e27d29c1a5b8', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7381735', '07381735');

-- GTA ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('195976X', '0195976X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7320191', '07320191');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7321317', '07321317');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('2149397', '02149397');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('19294654');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7383371', '07383371');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '42f9c17a-d4a9-47c7-98cb-bfc823dd80a1', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34282653');

-- GTA BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('7316844', '07316844');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7315090', '07315090');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7355459', '07355459');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7359233', '07359233');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('735892X', '0735892X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('739621X', '0739621X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34280227');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '16eb5299-aee3-4b34-a97a-7dc297f7e3df', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34284753');

-- GTA CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('7322569', '07322569');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'APOIO GERAL' FROM dim_efetivo WHERE matricula IN ('732040X', '0732040X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7320213', '07320213');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('7356410', '07356410');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34287507');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34281861');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '45519013-6c17-4978-aadf-b9ccf727fb3a', id, 'PATRULHEIRO' FROM dim_efetivo WHERE matricula IN ('34279091');

-- GUARDA ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '01298af7-c5cc-415c-8e9c-265c2a180485', id, 'ADJ OFICIAL DE DIA' FROM dim_efetivo WHERE matricula IN ('237485', '00237485');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '01298af7-c5cc-415c-8e9c-265c2a180485', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('730858', '00730858');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '01298af7-c5cc-415c-8e9c-265c2a180485', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('222925', '00222925');

-- GUARDA BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8d137e91-3b40-4c06-91cc-558f32d71661', id, 'ADJ OFICIAL DE DIA' FROM dim_efetivo WHERE matricula IN ('221430', '00221430');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8d137e91-3b40-4c06-91cc-558f32d71661', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('23267X', '0023267X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '8d137e91-3b40-4c06-91cc-558f32d71661', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('229180', '00229180');

-- GUARDA CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'beec6899-d2b6-4084-ad19-db8363032f50', id, 'ADJ OFICIAL DE DIA' FROM dim_efetivo WHERE matricula IN ('232475', '00232475');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'beec6899-d2b6-4084-ad19-db8363032f50', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('7330677', '07330677');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'beec6899-d2b6-4084-ad19-db8363032f50', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('7359969', '07359969');

-- GUARDA DELTA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'a5013818-6b14-499f-914f-3f21d5381143', id, 'ADJUNTO' FROM dim_efetivo WHERE matricula IN ('219487', '00219487');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'a5013818-6b14-499f-914f-3f21d5381143', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('1963074', '01963074');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'a5013818-6b14-499f-914f-3f21d5381143', id, 'RÁDIO OPERADOR' FROM dim_efetivo WHERE matricula IN ('7360940', '07360940');

-- LACUSTRE ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('242942', '00242942');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('740365', '00740365');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7313993', '07313993');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7321422', '07321422');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7328486', '07328486');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7318545', '07318545');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('34286756');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('34279741');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '64c2ac3e-c904-44fa-9ed2-3f5134074108', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7368968', '07368968');

-- LACUSTRE BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'ca5575c9-c8ef-469e-b63c-fdcb5413217f', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('217999', '00217999');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'ca5575c9-c8ef-469e-b63c-fdcb5413217f', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('728039', '00728039');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'ca5575c9-c8ef-469e-b63c-fdcb5413217f', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('736538', '00736538');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'ca5575c9-c8ef-469e-b63c-fdcb5413217f', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('1955306', '01955306');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'ca5575c9-c8ef-469e-b63c-fdcb5413217f', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('741566', '00741566');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'ca5575c9-c8ef-469e-b63c-fdcb5413217f', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7325770', '07325770');

-- LACUSTRE CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('237132', '00237132');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('730629', '00730629');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('739820', '00739820');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('1955411', '01955411');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7316518', '07316518');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7325967', '07325967');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('34278729');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'b08dc84e-fe4b-49b0-967d-2ddb417c78b7', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('34283569');

-- LACUSTRE DELTA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '6b59859e-f5fa-4b8f-a25d-92cbf4b287fe', id, 'COMANDANTE' FROM dim_efetivo WHERE matricula IN ('730289', '00730289');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '6b59859e-f5fa-4b8f-a25d-92cbf4b287fe', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('738549', '00738549');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '6b59859e-f5fa-4b8f-a25d-92cbf4b287fe', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7320582', '07320582');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '6b59859e-f5fa-4b8f-a25d-92cbf4b287fe', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('2149648', '02149648');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '6b59859e-f5fa-4b8f-a25d-92cbf4b287fe', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('34287655');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '6b59859e-f5fa-4b8f-a25d-92cbf4b287fe', id, 'TRIPULANTE' FROM dim_efetivo WHERE matricula IN ('7386486', '07386486');

-- OFICIAIS ADM members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7348908', '07348908');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7352387', '07352387');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7348479', '07348479');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7349165', '07349165');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7330154', '07330154');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7357036', '07357036');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7363729', '07363729');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('224707', '00224707');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7387563', '07387563');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('7363494', '07363494');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('215635', '00215635');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('508578', '00508578');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '3d252d77-5ebf-49b5-8160-f840daa75256', id, 'EXPEDIENTE ADM' FROM dim_efetivo WHERE matricula IN ('505838', '00505838');

-- SECRETARIA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '2b490da4-cd21-4f6d-824d-7533fe84f3aa', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7322631', '07322631');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '2b490da4-cd21-4f6d-824d-7533fe84f3aa', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7383746', '07383746');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '2b490da4-cd21-4f6d-824d-7533fe84f3aa', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7371977', '07371977');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '2b490da4-cd21-4f6d-824d-7533fe84f3aa', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7396082', '07396082');

-- SEÇÃO GARAGEM members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '5ba51db6-a3eb-4e7f-8e37-bcdad9086659', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('242624', '00242624');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '5ba51db6-a3eb-4e7f-8e37-bcdad9086659', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('21759X', '0021759X');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '5ba51db6-a3eb-4e7f-8e37-bcdad9086659', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('1966774', '01966774');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '5ba51db6-a3eb-4e7f-8e37-bcdad9086659', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7322143', '07322143');

-- SEÇÃO PROJETOS members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'bb54da5c-fcec-4ec4-8cf2-8c474856b272', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('231975', '00231975');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'bb54da5c-fcec-4ec4-8cf2-8c474856b272', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('1999176', '01999176');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'bb54da5c-fcec-4ec4-8cf2-8c474856b272', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('237388', '00237388');

-- SEÇÃO SLOG members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '424a0eb1-71db-4ff3-ade6-822a59df3c4b', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('244082', '00244082');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '424a0eb1-71db-4ff3-ade6-822a59df3c4b', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('2154250', '02154250');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '424a0eb1-71db-4ff3-ade6-822a59df3c4b', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7319126', '07319126');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '424a0eb1-71db-4ff3-ade6-822a59df3c4b', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7387385', '07387385');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '424a0eb1-71db-4ff3-ade6-822a59df3c4b', id, 'AUXILIAR ADMINISTRATIVO' FROM dim_efetivo WHERE matricula IN ('7381565', '07381565');

-- MANUTENÇÃO EMBARCAÇÕES members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '082e03f1-0107-42e5-b793-a57518e8aa3f', id, 'MECÂNICO' FROM dim_efetivo WHERE matricula IN ('121258', '00121258');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '082e03f1-0107-42e5-b793-a57518e8aa3f', id, 'MECÂNICO' FROM dim_efetivo WHERE matricula IN ('170089', '00170089');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '082e03f1-0107-42e5-b793-a57518e8aa3f', id, 'APOIO GERAL' FROM dim_efetivo WHERE matricula IN ('237442', '00237442');
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT '082e03f1-0107-42e5-b793-a57518e8aa3f', id, 'MECÂNICO' FROM dim_efetivo WHERE matricula IN ('2149621', '02149621');

-- MANUTENÇÃO INSTALAÇÕES members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT 'd50629e1-78ee-492f-abaf-98431a0c8f64', id, 'APOIO GERAL' FROM dim_efetivo WHERE matricula IN ('240257', '00240257');