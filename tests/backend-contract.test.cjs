'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const main=fs.readFileSync(path.join(root,'backend-kof/src/Main.kf'),'utf8');
const sql=fs.readFileSync(path.join(root,'backend-kof/sql/001_init.sql'),'utf8');
test('Auth0 protege as rotas sem modo anônimo',()=>{
  assert.match(main,/auth\.resourceServer\(jwksUrl, issuer, audience\)/);
  assert.match(main,/policy\.put\("auth", true\)/);
  assert.match(main,/app\.security\(policy\)/);
  assert.match(main,/MESCE_API_ENV/);
  assert.match(main,/if \(roles\.size == 0/);
  assert.match(main,/roles\.get\(0\)\.role != "COORDINATOR"/);
});
test('PII é cifrada antes do INSERT e consulta restrita ao coordenador',()=>{
  assert.match(main,/crypto\.encryptAesGcm\(input\.name, dataKey\)/);
  assert.match(main,/crypto\.encryptAesGcm\(input\.phone, dataKey\)/);
  assert.match(main,/db\.execute\(database, "INSERT INTO mesce_dev\.ministers\(name_ciphertext/);
  assert.match(sql,/name_ciphertext text NOT NULL/);
  assert.match(sql,/auth0_sub text NOT NULL UNIQUE/);
});
test('cadastro de assistidos e celebrações exige perfil autenticado',()=>{
  assert.match(main,/app\.post\("\/api\/assisted"\)/);
  assert.match(main,/app\.post\("\/api\/celebrations"\)/);
  assert.match(main,/app\.get\("\/api\/celebrations"\)/);
  assert.match(main,/crypto\.encryptAesGcm\(input\.address, dataKey\)/);
  assert.match(main,/json\.encode\(input\)/);
});
test('migração não importa dados reais ou libera privilégios públicos',()=>{
  assert.doesNotMatch(sql,/GRANT\s+ALL\s+ON\s+.*\s+TO\s+PUBLIC/i);
  assert.doesNotMatch(sql,/INSERT\s+INTO\s+mesce_dev\./i);
  assert.match(sql,/scope IN \('CELEBRATION','DAY','PERIOD'\)/);
});
