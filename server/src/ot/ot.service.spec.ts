import { OTService, Operation } from './ot.service';

describe('OTService', () => {
  let service: OTService;

  beforeEach(() => {
    service = new OTService();
  });

  it('keeps earlier same-position inserts before later inserts', () => {
    const first: Operation = {
      type: 'insert',
      position: 0,
      char: 'a',
      clientId: 'first',
      version: 0,
    };
    const second: Operation = {
      type: 'insert',
      position: 0,
      char: 'b',
      clientId: 'second',
      version: 0,
    };

    const transformedSecond = service.transform(second, first);

    expect(transformedSecond.position).toBe(1);
    expect(service.applyOperation('a', transformedSecond)).toBe('ab');
  });

  it('can apply repeated deletes from a single batched local edit', () => {
    let content = 'hello';
    const firstDelete: Operation = {
      type: 'delete',
      position: 0,
      clientId: 'client',
      version: 0,
    };
    const secondDelete: Operation = {
      type: 'delete',
      position: 0,
      clientId: 'client',
      version: 1,
    };

    content = service.applyOperation(content, firstDelete);
    content = service.applyOperation(content, secondDelete);

    expect(content).toBe('llo');
  });
});
