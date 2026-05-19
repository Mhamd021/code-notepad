"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTService = void 0;
const common_1 = require("@nestjs/common");
let OTService = class OTService {
    applyOperation(content, op) {
        if (op.type === 'insert') {
            return (content.slice(0, op.position) +
                op.char +
                content.slice(op.position));
        }
        if (op.type === 'delete') {
            if (op.position >= content.length)
                return content;
            return (content.slice(0, op.position) +
                content.slice(op.position + 1));
        }
        return content;
    }
    transform(op, against) {
        const result = { ...op };
        if (op.type === 'insert' && against.type === 'insert') {
            if (op.position > against.position) {
                result.position = op.position + 1;
            }
        }
        else if (op.type === 'insert' && against.type === 'delete') {
            if (op.position > against.position) {
                result.position = op.position - 1;
            }
        }
        else if (op.type === 'delete' && against.type === 'insert') {
            if (op.position >= against.position) {
                result.position = op.position + 1;
            }
        }
        else if (op.type === 'delete' && against.type === 'delete') {
            if (op.position === against.position) {
                result.position = -1;
            }
            else if (op.position > against.position) {
                result.position = op.position - 1;
            }
        }
        return result;
    }
    transformAgainstMany(op, ops) {
        let result = op;
        for (const against of ops) {
            result = this.transform(result, against);
            if (result.position === -1)
                break;
        }
        return result;
    }
};
exports.OTService = OTService;
exports.OTService = OTService = __decorate([
    (0, common_1.Injectable)()
], OTService);
//# sourceMappingURL=ot.service.js.map