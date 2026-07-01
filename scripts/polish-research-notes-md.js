#!/usr/bin/env node
/**
 * Polish research note markdown for the custom renderer:
 * - Flatten nested Reference lists (renderer only supports top-level `- `)
 * - Reduce em dashes; use colons for commit labels and RN titles
 * - Remove RN-16 inline metadata block (published view supplies metadata)
 * - Strip trailing double spaces
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTES_DIR = join(ROOT, 'docs/research-notes');

const REF_LABELS = [
  'Related commits',
  'Documentation',
  'Interactive demo',
  'Future research notes',
  'Source',
  'Repository',
];

function reduceEmDashes(text) {
  let out = text;

  // Commit / hash labels: `abc1234` — description
  out = out.replace(/(`[0-9a-f]{7}`)\s*\/\s*(`[0-9a-f]{7}`)\s*—\s*/gi, '$1 / $2: ');
  out = out.replace(/(`[0-9a-f]{7}`)\s*—\s*/gi, '$1: ');

  // RN code titles in lists: RN-08 — Title
  out = out.replace(/\b(RN-\d+)\s*—\s*/g, '$1: ');

  // Bold label em dashes
  out = out.replace(/\*\*([^*]+)\*\*\s*—\s*/g, '**$1**: ');

  // Common rhetorical patterns
  out = out.replace(/\s—\s+rather than\s/g, ', rather than ');
  out = out.replace(/\s—\s+not\s/g, ', not ');
  out = out.replace(/\s—\s+the\s/g, '; the ');
  out = out.replace(/\s—\s+and\s/g, ', and ');
  out = out.replace(/\s—\s+but\s/g, ', but ');
  out = out.replace(/\s—\s+while\s/g, ', while ');
  out = out.replace(/\s—\s+when\s/g, ', when ');
  out = out.replace(/\s—\s+which\s/g, ', which ');
  out = out.replace(/\s—\s+where\s/g, ', where ');
  out = out.replace(/\s—\s+once\s/g, '; once ');
  out = out.replace(/\s—\s+if\s/g, '; if ');
  out = out.replace(/\s—\s+so\s/g, ', so ');
  out = out.replace(/\s—\s+a\s/g, ': a ');
  out = out.replace(/\s—\s+an\s/g, ': an ');
  out = out.replace(/\s—\s+with\s/g, ', with ');
  out = out.replace(/\s—\s+without\s/g, ', without ');
  out = out.replace(/\s—\s+from\s/g, ', from ');
  out = out.replace(/\s—\s+for\s/g, ', for ');
  out = out.replace(/\s—\s+that\s/g, ', that ');
  out = out.replace(/\s—\s+this\s/g, '; this ');
  out = out.replace(/\s—\s+it\s/g, '; it ');
  out = out.replace(/\s—\s+you\s/g, '; you ');
  out = out.replace(/\s—\s+words\s/g, ': words ');
  out = out.replace(/\s—\s+never\s/g, ', never ');
  out = out.replace(/\s—\s+only\s/g, ', only ');
  out = out.replace(/\s—\s+still\s/g, ', still ');
  out = out.replace(/\s—\s+already\s/g, ', already ');
  out = out.replace(/\s—\s+enough\s/g, ', enough ');
  out = out.replace(/\s—\s+all\s/g, ', all ');
  out = out.replace(/\s—\s+both\s/g, ', both ');
  out = out.replace(/\s—\s+either\s/g, ', either ');
  out = out.replace(/\s—\s+or\s/g, ', or ');
  out = out.replace(/\s—\s+as\s/g, ', as ');
  out = out.replace(/\s—\s+at\s/g, ', at ');
  out = out.replace(/\s—\s+in\s/g, ', in ');
  out = out.replace(/\s—\s+on\s/g, ', on ');
  out = out.replace(/\s—\s+to\s/g, ', to ');
  out = out.replace(/\s—\s+by\s/g, ', by ');
  out = out.replace(/\s—\s+after\s/g, ', after ');
  out = out.replace(/\s—\s+before\s/g, ', before ');
  out = out.replace(/\s—\s+during\s/g, ', during ');
  out = out.replace(/\s—\s+until\s/g, ', until ');
  out = out.replace(/\s—\s+because\s/g, ', because ');
  out = out.replace(/\s—\s+though\s/g, ', though ');
  out = out.replace(/\s—\s+although\s/g, ', although ');
  out = out.replace(/\s—\s+however\s/g, '; however ');
  out = out.replace(/\s—\s+instead\s/g, ', instead ');
  out = out.replace(/\s—\s+including\s/g, ', including ');
  out = out.replace(/\s—\s+especially\s/g, ', especially ');
  out = out.replace(/\s—\s+explicitly\s/g, ', explicitly ');
  out = out.replace(/\s—\s+deliberately\s/g, ', deliberately ');
  out = out.replace(/\s—\s+approximately\s/g, ', approximately ');
  out = out.replace(/\s—\s+roughly\s/g, ', roughly ');
  out = out.replace(/\s—\s+about\s/g, ', about ');
  out = out.replace(/\s—\s+roughly\s/g, ', roughly ');
  out = out.replace(/\s—\s+enough to\s/g, ', enough to ');
  out = out.replace(/\s—\s+close to\s/g, ', close to ');
  out = out.replace(/\s—\s+closer to\s/g, ', closer to ');
  out = out.replace(/\s—\s+whether\s/g, ', whether ');
  out = out.replace(/\s—\s+can\s/g, ', can ');
  out = out.replace(/\s—\s+could\s/g, ', could ');
  out = out.replace(/\s—\s+would\s/g, ', would ');
  out = out.replace(/\s—\s+will\s/g, ', will ');
  out = out.replace(/\s—\s+should\s/g, ', should ');
  out = out.replace(/\s—\s+must\s/g, ', must ');
  out = out.replace(/\s—\s+may\s/g, ', may ');
  out = out.replace(/\s—\s+might\s/g, ', might ');
  out = out.replace(/\s—\s+do\s/g, ', do ');
  out = out.replace(/\s—\s+does\s/g, ', does ');
  out = out.replace(/\s—\s+did\s/g, ', did ');
  out = out.replace(/\s—\s+was\s/g, ', was ');
  out = out.replace(/\s—\s+were\s/g, ', were ');
  out = out.replace(/\s—\s+is\s/g, ', is ');
  out = out.replace(/\s—\s+are\s/g, ', are ');
  out = out.replace(/\s—\s+has\s/g, ', has ');
  out = out.replace(/\s—\s+have\s/g, ', have ');
  out = out.replace(/\s—\s+had\s/g, ', had ');
  out = out.replace(/\s—\s+remains\s/g, ', remains ');
  out = out.replace(/\s—\s+remained\s/g, ', remained ');
  out = out.replace(/\s—\s+became\s/g, ', became ');
  out = out.replace(/\s—\s+becomes\s/g, ', becomes ');
  out = out.replace(/\s—\s+became\s/g, ', became ');
  out = out.replace(/\s—\s+left\s/g, ', left ');
  out = out.replace(/\s—\s+kept\s/g, ', kept ');
  out = out.replace(/\s—\s+made\s/g, ', made ');
  out = out.replace(/\s—\s+took\s/g, ', took ');
  out = out.replace(/\s—\s+put\s/g, ', put ');
  out = out.replace(/\s—\s+let\s/g, ', let ');
  out = out.replace(/\s—\s+see\s/g, ', see ');
  out = out.replace(/\s—\s+ask\s/g, ', ask ');
  out = out.replace(/\s—\s+show\s/g, ', show ');
  out = out.replace(/\s—\s+use\s/g, ', use ');
  out = out.replace(/\s—\s+using\s/g, ', using ');
  out = out.replace(/\s—\s+used\s/g, ', used ');
  out = out.replace(/\s—\s+one\s/g, ': one ');
  out = out.replace(/\s—\s+two\s/g, ': two ');
  out = out.replace(/\s—\s+three\s/g, ': three ');
  out = out.replace(/\s—\s+four\s/g, ': four ');
  out = out.replace(/\s—\s+five\s/g, ': five ');
  out = out.replace(/\s—\s+six\s/g, ': six ');
  out = out.replace(/\s—\s+seven\s/g, ': seven ');
  out = out.replace(/\s—\s+eight\s/g, ': eight ');
  out = out.replace(/\s—\s+nine\s/g, ': nine ');
  out = out.replace(/\s—\s+ten\s/g, ': ten ');
  out = out.replace(/\s—\s+Gen\s/g, ' (Gen ');
  out = out.replace(/\s—\s+Phase\s/g, ' (Phase ');
  out = out.replace(/\s—\s+Jun\s/g, ' (Jun ');
  out = out.replace(/\s—\s+same\s/g, ', same ');
  out = out.replace(/\s—\s+every\s/g, ', every ');
  out = out.replace(/\s—\s+each\s/g, ', each ');
  out = out.replace(/\s—\s+any\s/g, ', any ');
  out = out.replace(/\s—\s+no\s/g, ', no ');
  out = out.replace(/\s—\s+not\s/g, ', not ');
  out = out.replace(/\s—\s+never\s/g, ', never ');
  out = out.replace(/\s—\s+always\s/g, ', always ');
  out = out.replace(/\s—\s+often\s/g, ', often ');
  out = out.replace(/\s—\s+usually\s/g, ', usually ');
  out = out.replace(/\s—\s+sometimes\s/g, ', sometimes ');
  out = out.replace(/\s—\s+rarely\s/g, ', rarely ');
  out = out.replace(/\s—\s+mostly\s/g, ', mostly ');
  out = out.replace(/\s—\s+mainly\s/g, ', mainly ');
  out = out.replace(/\s—\s+primarily\s/g, ', primarily ');
  out = out.replace(/\s—\s+secondarily\s/g, ', secondarily ');
  out = out.replace(/\s—\s+first\s/g, ', first ');
  out = out.replace(/\s—\s+second\s/g, ', second ');
  out = out.replace(/\s—\s+third\s/g, ', third ');
  out = out.replace(/\s—\s+last\s/g, ', last ');
  out = out.replace(/\s—\s+next\s/g, ', next ');
  out = out.replace(/\s—\s+then\s/g, ', then ');
  out = out.replace(/\s—\s+now\s/g, ', now ');
  out = out.replace(/\s—\s+here\s/g, ', here ');
  out = out.replace(/\s—\s+there\s/g, ', there ');
  out = out.replace(/\s—\s+today\s/g, ', today ');
  out = out.replace(/\s—\s+yesterday\s/g, ', yesterday ');
  out = out.replace(/\s—\s+tomorrow\s/g, ', tomorrow ');
  out = out.replace(/\s—\s+later\s/g, ', later ');
  out = out.replace(/\s—\s+earlier\s/g, ', earlier ');
  out = out.replace(/\s—\s+finally\s/g, ', finally ');
  out = out.replace(/\s—\s+ultimately\s/g, ', ultimately ');
  out = out.replace(/\s—\s+initially\s/g, ', initially ');
  out = out.replace(/\s—\s+eventually\s/g, ', eventually ');
  out = out.replace(/\s—\s+currently\s/g, ', currently ');
  out = out.replace(/\s—\s+originally\s/g, ', originally ');
  out = out.replace(/\s—\s+previously\s/g, ', previously ');
  out = out.replace(/\s—\s+recently\s/g, ', recently ');
  out = out.replace(/\s—\s+simultaneously\s/g, ', simultaneously ');
  out = out.replace(/\s—\s+independently\s/g, ', independently ');
  out = out.replace(/\s—\s+together\s/g, ', together ');
  out = out.replace(/\s—\s+apart\s/g, ', apart ');
  out = out.replace(/\s—\s+alone\s/g, ', alone ');
  out = out.replace(/\s—\s+again\s/g, ', again ');
  out = out.replace(/\s—\s+also\s/g, ', also ');
  out = out.replace(/\s—\s+too\s/g, ', too ');
  out = out.replace(/\s—\s+even\s/g, ', even ');
  out = out.replace(/\s—\s+just\s/g, ', just ');
  out = out.replace(/\s—\s+simply\s/g, ', simply ');
  out = out.replace(/\s—\s+merely\s/g, ', merely ');
  out = out.replace(/\s—\s+only\s/g, ', only ');
  out = out.replace(/\s—\s+almost\s/g, ', almost ');
  out = out.replace(/\s—\s+nearly\s/g, ', nearly ');
  out = out.replace(/\s—\s+quite\s/g, ', quite ');
  out = out.replace(/\s—\s+very\s/g, ', very ');
  out = out.replace(/\s—\s+more\s/g, ', more ');
  out = out.replace(/\s—\s+less\s/g, ', less ');
  out = out.replace(/\s—\s+most\s/g, ', most ');
  out = out.replace(/\s—\s+least\s/g, ', least ');
  out = out.replace(/\s—\s+some\s/g, ', some ');
  out = out.replace(/\s—\s+many\s/g, ', many ');
  out = out.replace(/\s—\s+few\s/g, ', few ');
  out = out.replace(/\s—\s+several\s/g, ', several ');
  out = out.replace(/\s—\s+other\s/g, ', other ');
  out = out.replace(/\s—\s+another\s/g, ', another ');
  out = out.replace(/\s—\s+such\s/g, ', such ');
  out = out.replace(/\s—\s+like\s/g, ', like ');
  out = out.replace(/\s—\s+unlike\s/g, ', unlike ');
  out = out.replace(/\s—\s+despite\s/g, ', despite ');
  out = out.replace(/\s—\s+since\s/g, ', since ');
  out = out.replace(/\s—\s+until\s/g, ', until ');
  out = out.replace(/\s—\s+unless\s/g, ', unless ');
  out = out.replace(/\s—\s+whether\s/g, ', whether ');
  out = out.replace(/\s—\s+while\s/g, ', while ');
  out = out.replace(/\s—\s+whereas\s/g, ', whereas ');
  out = out.replace(/\s—\s+given\s/g, ', given ');
  out = out.replace(/\s—\s+per\s/g, ', per ');
  out = out.replace(/\s—\s+via\s/g, ', via ');
  out = out.replace(/\s—\s+through\s/g, ', through ');
  out = out.replace(/\s—\s+under\s/g, ', under ');
  out = out.replace(/\s—\s+over\s/g, ', over ');
  out = out.replace(/\s—\s+above\s/g, ', above ');
  out = out.replace(/\s—\s+below\s/g, ', below ');
  out = out.replace(/\s—\s+between\s/g, ', between ');
  out = out.replace(/\s—\s+among\s/g, ', among ');
  out = out.replace(/\s—\s+within\s/g, ', within ');
  out = out.replace(/\s—\s+outside\s/g, ', outside ');
  out = out.replace(/\s—\s+inside\s/g, ', inside ');
  out = out.replace(/\s—\s+around\s/g, ', around ');
  out = out.replace(/\s—\s+across\s/g, ', across ');
  out = out.replace(/\s—\s+along\s/g, ', along ');
  out = out.replace(/\s—\s+beyond\s/g, ', beyond ');
  out = out.replace(/\s—\s+without\s/g, ', without ');
  out = out.replace(/\s—\s+within\s/g, ', within ');
  out = out.replace(/\s—\s+into\s/g, ', into ');
  out = out.replace(/\s—\s+onto\s/g, ', onto ');
  out = out.replace(/\s—\s+upon\s/g, ', upon ');
  out = out.replace(/\s—\s+toward\s/g, ', toward ');
  out = out.replace(/\s—\s+towards\s/g, ', towards ');
  out = out.replace(/\s—\s+against\s/g, ', against ');
  out = out.replace(/\s—\s+toward\s/g, ', toward ');
  out = out.replace(/\s—\s+despite\s/g, ', despite ');
  out = out.replace(/\s—\s+except\s/g, ', except ');
  out = out.replace(/\s—\s+plus\s/g, ', plus ');
  out = out.replace(/\s—\s+minus\s/g, ', minus ');
  out = out.replace(/\s—\s+times\s/g, ', times ');
  out = out.replace(/\s—\s+divided\s/g, ', divided ');
  out = out.replace(/\s—\s+multiplied\s/g, ', multiplied ');
  out = out.replace(/\s—\s+added\s/g, ', added ');
  out = out.replace(/\s—\s+removed\s/g, ', removed ');
  out = out.replace(/\s—\s+deleted\s/g, ', deleted ');
  out = out.replace(/\s—\s+created\s/g, ', created ');
  out = out.replace(/\s—\s+updated\s/g, ', updated ');
  out = out.replace(/\s—\s+changed\s/g, ', changed ');
  out = out.replace(/\s—\s+fixed\s/g, ', fixed ');
  out = out.replace(/\s—\s+broken\s/g, ', broken ');
  out = out.replace(/\s—\s+working\s/g, ', working ');
  out = out.replace(/\s—\s+failed\s/g, ', failed ');
  out = out.replace(/\s—\s+passed\s/g, ', passed ');
  out = out.replace(/\s—\s+true\s/g, ', true ');
  out = out.replace(/\s—\s+false\s/g, ', false ');
  out = out.replace(/\s—\s+yes\s/g, ', yes ');
  out = out.replace(/\s—\s+no\s/g, ', no ');
  out = out.replace(/\s—\s+maybe\s/g, ', maybe ');
  out = out.replace(/\s—\s+perhaps\s/g, ', perhaps ');
  out = out.replace(/\s—\s+probably\s/g, ', probably ');
  out = out.replace(/\s—\s+possibly\s/g, ', possibly ');
  out = out.replace(/\s—\s+certainly\s/g, ', certainly ');
  out = out.replace(/\s—\s+definitely\s/g, ', definitely ');
  out = out.replace(/\s—\s+absolutely\s/g, ', absolutely ');
  out = out.replace(/\s—\s+literally\s/g, ', literally ');
  out = out.replace(/\s—\s+figuratively\s/g, ', figuratively ');
  out = out.replace(/\s—\s+technically\s/g, ', technically ');
  out = out.replace(/\s—\s+practically\s/g, ', practically ');
  out = out.replace(/\s—\s+theoretically\s/g, ', theoretically ');
  out = out.replace(/\s—\s+historically\s/g, ', historically ');
  out = out.replace(/\s—\s+linguistically\s/g, ', linguistically ');
  out = out.replace(/\s—\s+phonetically\s/g, ', phonetically ');
  out = out.replace(/\s—\s+semantically\s/g, ', semantically ');
  out = out.replace(/\s—\s+grammatically\s/g, ', grammatically ');
  out = out.replace(/\s—\s+lexically\s/g, ', lexically ');
  out = out.replace(/\s—\s+morphologically\s/g, ', morphologically ');
  out = out.replace(/\s—\s+syntactically\s/g, ', syntactically ');
  out = out.replace(/\s—\s+pragmatically\s/g, ', pragmatically ');
  out = out.replace(/\s—\s+communicatively\s/g, ', communicatively ');
  out = out.replace(/\s—\s+editorially\s/g, ', editorially ');
  out = out.replace(/\s—\s+algorithmically\s/g, ', algorithmically ');
  out = out.replace(/\s—\s+mechanically\s/g, ', mechanically ');
  out = out.replace(/\s—\s+manually\s/g, ', manually ');
  out = out.replace(/\s—\s+automatically\s/g, ', automatically ');
  out = out.replace(/\s—\s+explicitly\s/g, ', explicitly ');
  out = out.replace(/\s—\s+implicitly\s/g, ', implicitly ');
  out = out.replace(/\s—\s+directly\s/g, ', directly ');
  out = out.replace(/\s—\s+indirectly\s/g, ', indirectly ');
  out = out.replace(/\s—\s+openly\s/g, ', openly ');
  out = out.replace(/\s—\s+secretly\s/g, ', secretly ');
  out = out.replace(/\s—\s+publicly\s/g, ', publicly ');
  out = out.replace(/\s—\s+privately\s/g, ', privately ');
  out = out.replace(/\s—\s+locally\s/g, ', locally ');
  out = out.replace(/\s—\s+globally\s/g, ', globally ');
  out = out.replace(/\s—\s+internally\s/g, ', internally ');
  out = out.replace(/\s—\s+externally\s/g, ', externally ');
  out = out.replace(/\s—\s+upstream\s/g, ', upstream ');
  out = out.replace(/\s—\s+downstream\s/g, ', downstream ');
  out = out.replace(/\s—\s+left\s/g, ', left ');
  out = out.replace(/\s—\s+right\s/g, ', right ');
  out = out.replace(/\s—\s+top\s/g, ', top ');
  out = out.replace(/\s—\s+bottom\s/g, ', bottom ');
  out = out.replace(/\s—\s+front\s/g, ', front ');
  out = out.replace(/\s—\s+back\s/g, ', back ');
  out = out.replace(/\s—\s+side\s/g, ', side ');
  out = out.replace(/\s—\s+center\s/g, ', center ');
  out = out.replace(/\s—\s+middle\s/g, ', middle ');
  out = out.replace(/\s—\s+edge\s/g, ', edge ');
  out = out.replace(/\s—\s+corner\s/g, ', corner ');
  out = out.replace(/\s—\s+end\s/g, ', end ');
  out = out.replace(/\s—\s+start\s/g, ', start ');
  out = out.replace(/\s—\s+beginning\s/g, ', beginning ');
  out = out.replace(/\s—\s+finish\s/g, ', finish ');
  out = out.replace(/\s—\s+complete\s/g, ', complete ');
  out = out.replace(/\s—\s+incomplete\s/g, ', incomplete ');
  out = out.replace(/\s—\s+partial\s/g, ', partial ');
  out = out.replace(/\s—\s+full\s/g, ', full ');
  out = out.replace(/\s—\s+empty\s/g, ', empty ');
  out = out.replace(/\s—\s+open\s/g, ', open ');
  out = out.replace(/\s—\s+closed\s/g, ', closed ');
  out = out.replace(/\s—\s+active\s/g, ', active ');
  out = out.replace(/\s—\s+inactive\s/g, ', inactive ');
  out = out.replace(/\s—\s+enabled\s/g, ', enabled ');
  out = out.replace(/\s—\s+disabled\s/g, ', disabled ');
  out = out.replace(/\s—\s+valid\s/g, ', valid ');
  out = out.replace(/\s—\s+invalid\s/g, ', invalid ');
  out = out.replace(/\s—\s+correct\s/g, ', correct ');
  out = out.replace(/\s—\s+incorrect\s/g, ', incorrect ');
  out = out.replace(/\s—\s+accurate\s/g, ', accurate ');
  out = out.replace(/\s—\s+inaccurate\s/g, ', inaccurate ');
  out = out.replace(/\s—\s+precise\s/g, ', precise ');
  out = out.replace(/\s—\s+imprecise\s/g, ', imprecise ');
  out = out.replace(/\s—\s+exact\s/g, ', exact ');
  out = out.replace(/\s—\s+approximate\s/g, ', approximate ');
  out = out.replace(/\s—\s+rough\s/g, ', rough ');
  out = out.replace(/\s—\s+smooth\s/g, ', smooth ');
  out = out.replace(/\s—\s+clean\s/g, ', clean ');
  out = out.replace(/\s—\s+dirty\s/g, ', dirty ');
  out = out.replace(/\s—\s+clear\s/g, ', clear ');
  out = out.replace(/\s—\s+unclear\s/g, ', unclear ');
  out = out.replace(/\s—\s+obvious\s/g, ', obvious ');
  out = out.replace(/\s—\s+subtle\s/g, ', subtle ');
  out = out.replace(/\s—\s+simple\s/g, ', simple ');
  out = out.replace(/\s—\s+complex\s/g, ', complex ');
  out = out.replace(/\s—\s+easy\s/g, ', easy ');
  out = out.replace(/\s—\s+hard\s/g, ', hard ');
  out = out.replace(/\s—\s+difficult\s/g, ', difficult ');
  out = out.replace(/\s—\s+straightforward\s/g, ', straightforward ');
  out = out.replace(/\s—\s+complicated\s/g, ', complicated ');
  out = out.replace(/\s—\s+transparent\s/g, ', transparent ');
  out = out.replace(/\s—\s+opaque\s/g, ', opaque ');
  out = out.replace(/\s—\s+visible\s/g, ', visible ');
  out = out.replace(/\s—\s+hidden\s/g, ', hidden ');
  out = out.replace(/\s—\s+known\s/g, ', known ');
  out = out.replace(/\s—\s+unknown\s/g, ', unknown ');
  out = out.replace(/\s—\s+familiar\s/g, ', familiar ');
  out = out.replace(/\s—\s+unfamiliar\s/g, ', unfamiliar ');
  out = out.replace(/\s—\s+strange\s/g, ', strange ');
  out = out.replace(/\s—\s+normal\s/g, ', normal ');
  out = out.replace(/\s—\s+typical\s/g, ', typical ');
  out = out.replace(/\s—\s+atypical\s/g, ', atypical ');
  out = out.replace(/\s—\s+usual\s/g, ', usual ');
  out = out.replace(/\s—\s+unusual\s/g, ', unusual ');
  out = out.replace(/\s—\s+common\s/g, ', common ');
  out = out.replace(/\s—\s+rare\s/g, ', rare ');
  out = out.replace(/\s—\s+unique\s/g, ', unique ');
  out = out.replace(/\s—\s+standard\s/g, ', standard ');
  out = out.replace(/\s—\s+nonstandard\s/g, ', nonstandard ');
  out = out.replace(/\s—\s+formal\s/g, ', formal ');
  out = out.replace(/\s—\s+informal\s/g, ', informal ');
  out = out.replace(/\s—\s+casual\s/g, ', casual ');
  out = out.replace(/\s—\s+serious\s/g, ', serious ');
  out = out.replace(/\s—\s+playful\s/g, ', playful ');
  out = out.replace(/\s—\s+experimental\s/g, ', experimental ');
  out = out.replace(/\s—\s+production\s/g, ', production ');
  out = out.replace(/\s—\s+prototype\s/g, ', prototype ');
  out = out.replace(/\s—\s+final\s/g, ', final ');
  out = out.replace(/\s—\s+draft\s/g, ', draft ');
  out = out.replace(/\s—\s+published\s/g, ', published ');
  out = out.replace(/\s—\s+unpublished\s/g, ', unpublished ');
  out = out.replace(/\s—\s+approved\s/g, ', approved ');
  out = out.replace(/\s—\s+rejected\s/g, ', rejected ');
  out = out.replace(/\s—\s+pending\s/g, ', pending ');
  out = out.replace(/\s—\s+resolved\s/g, ', resolved ');
  out = out.replace(/\s—\s+unresolved\s/g, ', unresolved ');
  out = out.replace(/\s—\s+open\s/g, ', open ');
  out = out.replace(/\s—\s+closed\s/g, ', closed ');
  out = out.replace(/\s—\s+superseded\s/g, ', superseded ');
  out = out.replace(/\s—\s+foundational\s/g, ', foundational ');
  out = out.replace(/\s—\s+active\s/g, ', active ');
  out = out.replace(/\s—\s+complete\s/g, ', complete ');
  out = out.replace(/\s—\s+in progress\s/gi, ', in progress ');

  // Remaining em dashes: prefer colon in mid-sentence, comma elsewhere
  out = out.replace(/\s—\s+/g, (match, offset, str) => {
    const before = str.slice(Math.max(0, offset - 40), offset);
    if (/[:?]\s*$/.test(before) || /\*\*[^*]*$/.test(before)) return ': ';
    return ', ';
  });

  return out;
}

function flattenReferences(content) {
  const lines = content.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '## References') {
      out.push(line);
      i += 1;
      while (i < lines.length && !lines[i].startsWith('## ')) {
        if (!lines[i].trim()) {
          out.push(lines[i]);
          i += 1;
          continue;
        }
        const trimmed = lines[i].trim();

        const labelMatch = trimmed.match(/^-\s+(Related commits|Documentation|Interactive demo|Future research notes|Source|Repository):\s*$/);
        if (labelMatch) {
          out.push('');
          out.push(`**${labelMatch[1]}**`);
          i += 1;
          while (i < lines.length && /^  - /.test(lines[i])) {
            out.push('- ' + lines[i].trim().slice(2));
            i += 1;
          }
          continue;
        }

        const inlineLabel = trimmed.match(/^-\s+(Documentation|Interactive demo|Future research notes|Source|Repository):\s*(.+)$/);
        if (inlineLabel) {
          out.push('');
          out.push(`**${inlineLabel[1]}:** ${inlineLabel[2]}`);
          i += 1;
          continue;
        }

        out.push(lines[i]);
        i += 1;
      }
      continue;
    }

    out.push(line);
    i += 1;
  }

  return out.join('\n');
}

function removeRn16MetadataBlock(content, filename) {
  if (!filename.includes('RN-16')) return content;
  return content.replace(
    /(# [^\n]+\n\n)\*\*Date:\*\*[^\n]+\n\*\*Stage:\*\*[^\n]+\n\*\*Project:\*\*[^\n]+\n\*\*Status:\*\*[^\n]+\n\n/,
    '$1',
  );
}

function stripTrailingSpaces(content) {
  return content
    .split('\n')
    .map((line) => line.replace(/ +$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

async function main() {
  const files = (await readdir(NOTES_DIR)).filter((f) => f.endsWith('.md')).sort();
  const stats = { files: 0, emBefore: 0, emAfter: 0, nestedBefore: 0 };

  for (const file of files) {
    const path = join(NOTES_DIR, file);
    const original = await readFile(path, 'utf8');
    stats.emBefore += (original.match(/—/g) || []).length;
    stats.nestedBefore += original.split('\n').filter((l) => /^  - /.test(l)).length;

    let next = original;
    next = removeRn16MetadataBlock(next, file);
    next = flattenReferences(next);
    next = reduceEmDashes(next);
    next = stripTrailingSpaces(next);

    stats.emAfter += (next.match(/—/g) || []).length;
    if (next !== original) {
      await writeFile(path, next);
      stats.files += 1;
    }
  }

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
