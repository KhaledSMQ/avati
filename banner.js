/*
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = ({ pkg, version, homepage}) => `/*!
 * ${ pkg } ${ version }
 * Copyright (c) ${ new Date().getFullYear() } Khaled Sameer <khaled.smq@hotmail.com>
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit ${ homepage } for details.
 */

/* eslint-disable */
`;
