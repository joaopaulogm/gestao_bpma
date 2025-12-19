-- First, delete all existing team members and teams to recreate from scratch
DELETE FROM fat_equipe_membros;
DELETE FROM dim_equipes;

-- Insert teams based on the Excel data with correct grupamentos

-- ARMEIRO teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('ALFA', 'ARMEIRO', '24 X 72', 'APOIO OPERACIONAL'),
('BRAVO', 'ARMEIRO', '24 X 72', 'APOIO OPERACIONAL'),
('CHARLIE', 'ARMEIRO', '24 X 72', 'APOIO OPERACIONAL'),
('DELTA', 'ARMEIRO', '24 X 72', 'APOIO OPERACIONAL');

-- COMISSÕES teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('CIP 12X36', 'COMISSÕES', '12 X 36', 'APOIO OPERACIONAL'),
('CIP ADM', 'COMISSÕES', 'EXPEDIENTE', 'ADMINISTRATIVO');

-- EXPEDIENTE teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('SECRETARIA', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO GARAGEM', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO PROJETOS', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO SECRIMPO', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO SJD', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO SLOG', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO SOI', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO SP', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO'),
('SEÇÃO SVG', 'EXPEDIENTE', 'EXPEDIENTE', 'ADMINISTRATIVO');

-- GOC teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('ALFA', 'GOC', '24 X 72', 'OPERACIONAL'),
('BRAVO', 'GOC', '24 X 72', 'OPERACIONAL'),
('CHARLIE', 'GOC', '24 X 72', 'OPERACIONAL'),
('DELTA', 'GOC', '24 X 72', 'OPERACIONAL');

-- GTA teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('ALFA', 'GTA', '12 X 60', 'OPERACIONAL'),
('BRAVO', 'GTA', '12 X 60', 'OPERACIONAL'),
('CHARLIE', 'GTA', '12 X 60', 'OPERACIONAL');

-- GUARDA teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('ALFA', 'GUARDA', '24 X 72', 'APOIO OPERACIONAL'),
('BRAVO', 'GUARDA', '24 X 72', 'APOIO OPERACIONAL'),
('CHARLIE', 'GUARDA', '24 X 72', 'APOIO OPERACIONAL'),
('DELTA', 'GUARDA', '24 X 72', 'APOIO OPERACIONAL');

-- INSTRUÇÕES E CURSO teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('COORDENAÇÃO LACUSTRE', 'INSTRUÇÕES E CURSO', '12 X 36', 'APOIO OPERACIONAL'),
('INSTRUÇÃO CFP', 'INSTRUÇÕES E CURSO', '12 X 36', 'APOIO OPERACIONAL');

-- LACUSTRE teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('ALFA', 'LACUSTRE', '24 X 72', 'OPERACIONAL'),
('BRAVO', 'LACUSTRE', '24 X 72', 'OPERACIONAL'),
('CHARLIE', 'LACUSTRE', '24 X 72', 'OPERACIONAL'),
('DELTA', 'LACUSTRE', '24 X 72', 'OPERACIONAL');

-- MANUTENÇÃO teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('MANUTENÇÃO EMBARCAÇÕES', 'MANUTENÇÃO', '12 X 36', 'APOIO OPERACIONAL'),
('MANUTENÇÃO INSTALAÇÕES', 'MANUTENÇÃO', '12 X 36', 'APOIO OPERACIONAL');

-- MOTORISTAS teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('MOTORISTA DE DIA', 'MOTORISTAS', '24 X 72', 'APOIO OPERACIONAL'),
('MOTORISTA DO CMT', 'MOTORISTAS', '12 X 36', 'APOIO OPERACIONAL');

-- OFICIAIS teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('OFICIAIS ADM', 'OFICIAIS', 'EXPEDIENTE', 'ADMINISTRATIVO');

-- OFICIAIS OPERACIONAIS
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('OFICIAL DE DIA', 'OFICIAIS OPERACIONAIS', '24 X 72', 'OPERACIONAL');

-- PREALG
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('PREALG', 'PREALG', 'EXPEDIENTE', 'PROJETOS SOCIAIS');

-- RPA AMBIENTAL teams
INSERT INTO dim_equipes (nome, grupamento, escala, servico) VALUES
('ALFA', 'RPA AMBIENTAL', '24 X 72', 'OPERACIONAL'),
('BRAVO', 'RPA AMBIENTAL', '24 X 72', 'OPERACIONAL'),
('CHARLIE', 'RPA AMBIENTAL', '24 X 72', 'OPERACIONAL'),
('DELTA', 'RPA AMBIENTAL', '24 X 72', 'OPERACIONAL');

-- Now insert members based on matriculas from Excel
-- ARMEIRO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'ARMEIRO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'ALFA' AND e.grupamento = 'ARMEIRO' AND ef.matricula IN ('0073943X', '73943X');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'ARMEIRO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'BRAVO' AND e.grupamento = 'ARMEIRO' AND ef.matricula IN ('07368844', '7368844');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'ARMEIRO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CHARLIE' AND e.grupamento = 'ARMEIRO' AND ef.matricula IN ('07379536', '7379536');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'ARMEIRO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'DELTA' AND e.grupamento = 'ARMEIRO' AND ef.matricula IN ('0073909X', '73909X');

-- COMISSÕES CIP 12X36 members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'APOIO GERAL'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CIP 12X36' AND e.grupamento = 'COMISSÕES' 
AND ef.matricula IN ('00229113', '229113', '07313217', '7313217', '07329350', '7329350', '0731812X', '731812X', '00183008', '183008');

-- COMISSÕES CIP ADM members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CIP ADM' AND e.grupamento = 'COMISSÕES' 
AND ef.matricula IN ('07383746', '7383746', '07371977', '7371977');

-- EXPEDIENTE SECRETARIA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SECRETARIA' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('07322631', '7322631', '07383746', '7383746', '07371977', '7371977', '07396082', '7396082');

-- GOC ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00213985', '213985') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'ALFA' AND e.grupamento = 'GOC' 
AND ef.matricula IN ('00213985', '213985', '02151189', '2151189', '34283544', '07383738', '7383738', '34251271');

-- GOC BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00740195', '740195') THEN 'COMANDANTE'
  WHEN ef.matricula IN ('07384033', '7384033') THEN 'MOTORISTA'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'BRAVO' AND e.grupamento = 'GOC' 
AND ef.matricula IN ('07314051', '7314051', '07315910', '7315910', '07323589', '7323589', '00740195', '740195', '07316771', '7316771', '07369964', '7369964', '34280464', '07339612', '7339612', '07384033', '7384033');

-- GOC CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00230790', '230790') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CHARLIE' AND e.grupamento = 'GOC' 
AND ef.matricula IN ('00729396', '729396', '00728632', '728632', '00230790', '230790', '07318138', '7318138', '07316100', '7316100', '07361173', '7361173');

-- GOC DELTA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('07318960', '7318960') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'DELTA' AND e.grupamento = 'GOC' 
AND ef.matricula IN ('07318961', '7318961', '0731471X', '731471X', '07318960', '7318960', '07392834', '7392834', '07339728', '7339728', '07381735', '7381735');

-- GTA ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('0195976X', '195976X') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'ALFA' AND e.grupamento = 'GTA' 
AND ef.matricula IN ('07320191', '7320191', '0195976X', '195976X', '07321317', '7321317', '02149397', '2149397', '19294654', '07383371', '7383371', '34282653');

-- GTA BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('07316844', '7316844') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'BRAVO' AND e.grupamento = 'GTA' 
AND ef.matricula IN ('07315090', '7315090', '07316844', '7316844', '07355459', '7355459', '07359233', '7359233', '0735892X', '735892X', '0739621X', '739621X', '34280227', '34284753');

-- GTA CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('07322569', '7322569') THEN 'COMANDANTE'
  WHEN ef.matricula IN ('0732040X', '732040X') THEN 'APOIO GERAL'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CHARLIE' AND e.grupamento = 'GTA' 
AND ef.matricula IN ('07322569', '7322569', '0732040X', '732040X', '07320213', '7320213', '07356410', '7356410', '34287507', '34281861', '34279091');

-- GUARDA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00237485', '237485') THEN 'ADJ OFICIAL DE DIA'
  ELSE 'RÁDIO OPERADOR'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'ALFA' AND e.grupamento = 'GUARDA' 
AND ef.matricula IN ('00730858', '730858', '00222925', '222925', '00237485', '237485');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00221430', '221430') THEN 'ADJ OFICIAL DE DIA'
  ELSE 'RÁDIO OPERADOR'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'BRAVO' AND e.grupamento = 'GUARDA' 
AND ef.matricula IN ('0023267X', '23267X', '00221430', '221430', '00229180', '229180');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00232475', '232475') THEN 'ADJ OFICIAL DE DIA'
  ELSE 'RÁDIO OPERADOR'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CHARLIE' AND e.grupamento = 'GUARDA' 
AND ef.matricula IN ('00232475', '232475', '07330677', '7330677', '07359969', '7359969');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00219487', '219487') THEN 'ADJUNTO'
  ELSE 'RÁDIO OPERADOR'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'DELTA' AND e.grupamento = 'GUARDA' 
AND ef.matricula IN ('00219487', '219487', '01963074', '1963074', '07360940', '7360940');

-- LACUSTRE ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00242942', '242942') THEN 'COMANDANTE'
  ELSE 'TRIPULANTE'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'ALFA' AND e.grupamento = 'LACUSTRE' 
AND ef.matricula IN ('00242942', '242942', '00740365', '740365', '07313993', '7313993', '07321422', '7321422', '07328486', '7328486', '07318545', '7318545', '34286756', '34279741', '07368968', '7368968');

-- LACUSTRE BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('217999', '00217999') THEN 'COMANDANTE'
  ELSE 'TRIPULANTE'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'BRAVO' AND e.grupamento = 'LACUSTRE' 
AND ef.matricula IN ('217999', '00217999', '728039', '00728039', '736538', '00736538', '07365380', '1955306', '01955306', '741566', '00741566', '7325770', '07325770');

-- LACUSTRE CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00237132', '237132') THEN 'COMANDANTE'
  ELSE 'TRIPULANTE'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CHARLIE' AND e.grupamento = 'LACUSTRE' 
AND ef.matricula IN ('00730629', '730629', '00237132', '237132', '00739820', '739820', '01955411', '1955411', '07316518', '7316518', '07325967', '7325967', '34278729', '34283569');

-- LACUSTRE DELTA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('730289', '00730289') THEN 'COMANDANTE'
  ELSE 'TRIPULANTE'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'DELTA' AND e.grupamento = 'LACUSTRE' 
AND ef.matricula IN ('730289', '00730289', '738549', '00738549', '7320582', '07320582', '2149648', '02149648', '34287655', '7386486', '07386486');

-- RPA AMBIENTAL ALFA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00244007', '244007') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'ALFA' AND e.grupamento = 'RPA AMBIENTAL' 
AND ef.matricula IN ('00244007', '244007', '07320604', '7320604', '07323980', '7323980', '07381905', '7381905', '07391994', '7391994', '34280367', '32579527');

-- RPA AMBIENTAL BRAVO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00732397', '732397') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'BRAVO' AND e.grupamento = 'RPA AMBIENTAL' 
AND ef.matricula IN ('00732397', '732397', '00235989', '235989', '07317921', '7317921', '0731549X', '731549X', '07329393', '7329393', '0734578X', '734578X', '07379544', '7379544', '21071993');

-- RPA AMBIENTAL CHARLIE members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('02149419', '2149419') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'CHARLIE' AND e.grupamento = 'RPA AMBIENTAL' 
AND ef.matricula IN ('02149419', '2149419', '07358555', '7358555', '34288481', '34284788', '34278516', '07387369', '7387369', '34289437');

-- RPA AMBIENTAL DELTA members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, CASE 
  WHEN ef.matricula IN ('00228915', '228915') THEN 'COMANDANTE'
  ELSE 'PATRULHEIRO'
END
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'DELTA' AND e.grupamento = 'RPA AMBIENTAL' 
AND ef.matricula IN ('00737402', '737402', '00228915', '228915', '00240613', '240613', '02156180', '2156180', '34284672', '07381956', '7381956', '34281991', '07382677', '7382677');

-- MANUTENÇÃO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'MECÂNICO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'MANUTENÇÃO EMBARCAÇÕES' AND e.grupamento = 'MANUTENÇÃO' 
AND ef.matricula IN ('00121258', '121258', '00170089', '170089', '02149621', '2149621');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'APOIO GERAL'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'MANUTENÇÃO EMBARCAÇÕES' AND e.grupamento = 'MANUTENÇÃO' 
AND ef.matricula IN ('00237442', '237442');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'APOIO GERAL'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'MANUTENÇÃO INSTALAÇÕES' AND e.grupamento = 'MANUTENÇÃO' 
AND ef.matricula IN ('00240257', '240257');

-- MOTORISTAS members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'MOTORISTA OFICIAL DE DIA'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'MOTORISTA DE DIA' AND e.grupamento = 'MOTORISTAS' 
AND ef.matricula IN ('00241334', '241334', '00729442', '729442', '07381204', '7381204', '07387369', '7387369');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'MOTORISTA DO CMT'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'MOTORISTA DO CMT' AND e.grupamento = 'MOTORISTAS' 
AND ef.matricula IN ('07329350', '7329350', '0731812X', '731812X', '00183008', '183008');

-- OFICIAIS ADM members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'EXPEDIENTE ADM'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'OFICIAIS ADM' AND e.grupamento = 'OFICIAIS' 
AND ef.matricula IN ('07348908', '7348908', '07352387', '7352387', '07348479', '7348479', '07349165', '7349165', '07330154', '7330154', '07357036', '7357036', '07363729', '7363729', '00224707', '224707', '07387563', '7387563', '07363494', '7363494', '00215635', '215635', '00508578', '508578', '00505838', '505838');

-- OFICIAIS OPERACIONAIS members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'OFICIAL DE DIA'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'OFICIAL DE DIA' AND e.grupamento = 'OFICIAIS OPERACIONAIS' 
AND ef.matricula IN ('07348908', '7348908', '07352387', '7352387', '07348479', '7348479', '07349165', '7349165', '07330154', '7330154', '07357036', '7357036', '07363729', '7363729', '00224707', '224707', '07387563', '7387563', '00505838', '505838');

-- PREALG members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'POLÍCIA PREVENTIVA'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'PREALG' AND e.grupamento = 'PREALG' 
AND ef.matricula IN ('00221074', '221074', '01954695', '1954695', '0073876X', '73876X', '02184583', '2184583', '07327013', '7327013', '07384637', '7384637', '07371209', '7371209', '00213411', '213411');

-- EXPEDIENTE SEÇÃO GARAGEM members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO GARAGEM' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('00242624', '242624', '0021759X', '21759X', '01966774', '1966774', '07322143', '7322143');

-- EXPEDIENTE SEÇÃO PROJETOS members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO PROJETOS' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('00231975', '231975', '01999176', '1999176', '00237388', '237388');

-- EXPEDIENTE SEÇÃO SECRIMPO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO SECRIMPO' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('07318553', '7318553', '07355297', '7355297');

-- EXPEDIENTE SEÇÃO SJD members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO SJD' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('01998560', '1998560', '07316054', '7316054');

-- EXPEDIENTE SEÇÃO SLOG members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO SLOG' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('00244082', '244082', '02154250', '2154250', '07319126', '7319126', '07387385', '7387385', '07381565', '7381565');

-- EXPEDIENTE SEÇÃO SOI members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO SOI' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('07315139', '7315139', '07329539', '7329539', '07361580', '7361580');

-- EXPEDIENTE SEÇÃO SP members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO SP' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('00728012', '728012', '07315902', '7315902', '07313012', '7313012', '00239453', '239453');

-- EXPEDIENTE SEÇÃO SVG members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'AUXILIAR ADMINISTRATIVO'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'SEÇÃO SVG' AND e.grupamento = 'EXPEDIENTE' 
AND ef.matricula IN ('0215093X', '215093X', '00237221', '237221');

-- INSTRUÇÕES E CURSO members
INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'INSTRUTOR'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'COORDENAÇÃO LACUSTRE' AND e.grupamento = 'INSTRUÇÕES E CURSO' 
AND ef.matricula IN ('00728039', '728039', '00730629', '730629', '01955306', '1955306', '07325770', '7325770');

INSERT INTO fat_equipe_membros (equipe_id, efetivo_id, funcao)
SELECT e.id, ef.id, 'INSTRUTOR'
FROM dim_equipes e, dim_efetivo ef
WHERE e.nome = 'INSTRUÇÃO CFP' AND e.grupamento = 'INSTRUÇÕES E CURSO' 
AND ef.matricula IN ('00737402', '737402', '00232475', '232475', '00221074', '221074', '00731285', '731285', '00730629', '730629', '01955918', '1955918', '07321317', '7321317', '0073876X', '73876X', '01955306', '1955306', '02184583', '2184583', '07313217', '7313217', '07316844', '7316844', '07322569', '7322569', '0732040X', '732040X', '07320213', '7320213', '07355459', '7355459', '07356410', '7356410', '0739621X', '739621X', '07385145', '7385145', '07369964', '7369964', '07389612', '7389612', '07386486', '7386486', '07368968', '7368968');