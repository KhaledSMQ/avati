/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


/**
 * Environment and development mode detection
 */
export const Environment = {
    isDevelopment(): boolean {
        try {
            // Check various development indicators
            return Boolean(
                // Check for __DEV__ flag
                (typeof __DEV__ !== 'undefined' && __DEV__) ||
                // Check for development mode in module
                (typeof process !== 'undefined' &&
                    process.env &&
                    process.env.NODE_ENV === 'development') ||
                // Check for any custom development flags you might use
                (typeof window !== 'undefined' &&
                    (window as any).__DEVELOPMENT__),
            );
        } catch {
            // If we can't determine, assume production for safety
            return false;
        }
    },
};
