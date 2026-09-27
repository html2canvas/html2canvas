import { deepStrictEqual, ok, strictEqual } from 'assert';
import { Bounds } from '../../css/layout/bounds';
import { Context, ContextOptions } from '../context';

const baseOptions = (overrides: Partial<ContextOptions> = {}): ContextOptions => ({
    logging: false,
    imageTimeout: 0,
    useCORS: false,
    allowTaint: false,
    ...overrides,
});

describe('Context', () => {
    describe('error', () => {
        it('invokes the onError callback with an Error when a message is reported', () => {
            const received: Error[] = [];
            const context = new Context(
                baseOptions({ onError: (e: Error) => received.push(e) }),
                new Bounds(0, 0, 0, 0),
            );

            context.error('Error loading image http://example.com/x.jpg');

            deepStrictEqual(received.length, 1);
            ok(received[0] instanceof Error);
            strictEqual(received[0].message, 'Error loading image http://example.com/x.jpg');
        });

        it('passes through the original Error instance when one is provided', () => {
            const received: Error[] = [];
            const original = new Error('network failure');
            const context = new Context(
                baseOptions({ onError: (e: Error) => received.push(e) }),
                new Bounds(0, 0, 0, 0),
            );

            context.error('Error loading svg', original);

            deepStrictEqual(received.length, 1);
            strictEqual(received[0], original);
        });

        it('does not throw when no onError callback is provided', () => {
            const context = new Context(baseOptions(), new Bounds(0, 0, 0, 0));
            // Should simply log (logging disabled here) without throwing.
            context.error('Error loading image');
        });
    });
});
