"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ot_service_1 = require("./ot.service");
const ot = new ot_service_1.OTService();
let content = "Hello";
const opAli = {
    type: 'insert', position: 5, char: '!',
    clientId: 'ali', version: 0,
};
const opSara = {
    type: 'delete', position: 0,
    clientId: 'sara', version: 0,
};
content = ot.applyOperation(content, opAli);
console.log('After Ali:', content);
const transformedSara = ot.transform(opSara, opAli);
console.log('Sara position after transform:', transformedSara.position);
content = ot.applyOperation(content, transformedSara);
console.log('Final:', content);
let content2 = "Hello";
const op1 = { type: 'delete', position: 2, clientId: 'a', version: 0 };
const op2 = { type: 'delete', position: 2, clientId: 'b', version: 0 };
content2 = ot.applyOperation(content2, op1);
console.log('After op1:', content2);
const transformed2 = ot.transform(op2, op1);
console.log('op2 position:', transformed2.position);
if (transformed2.position !== -1) {
    content2 = ot.applyOperation(content2, transformed2);
}
console.log('Final:', content2);
//# sourceMappingURL=ot.test.js.map