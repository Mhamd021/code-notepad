import { OTService, Operation } from './ot.service';

const ot = new OTService();

// ── Test 1 — insert vs insert ──────────────────────────
let content = "Hello";

const opAli: Operation = {
  type: 'insert', position: 5, char: '!',
  clientId: 'ali', version: 0,
};

const opSara: Operation = {
  type: 'delete', position: 0,
  clientId: 'sara', version: 0,
};

// السيرفر يطبق علي أولاً
content = ot.applyOperation(content, opAli);
console.log('After Ali:', content); // "Hello!"

// يحوّل عملية سارة بناءً على عملية علي
const transformedSara = ot.transform(opSara, opAli);
console.log('Sara position after transform:', transformedSara.position); // 0 (لم يتغير لأنها قبل علي)

content = ot.applyOperation(content, transformedSara);
console.log('Final:', content); // "ello!"

// ── Test 2 — delete vs delete ──────────────────────────
let content2 = "Hello";

const op1: Operation = { type: 'delete', position: 2, clientId: 'a', version: 0 };
const op2: Operation = { type: 'delete', position: 2, clientId: 'b', version: 0 };

content2 = ot.applyOperation(content2, op1);
console.log('After op1:', content2); // "Helo"

const transformed2 = ot.transform(op2, op1);
console.log('op2 position:', transformed2.position); // -1 (ملغاة — نفس الحرف)

if (transformed2.position !== -1) {
  content2 = ot.applyOperation(content2, transformed2);
}
console.log('Final:', content2); // "Helo"  