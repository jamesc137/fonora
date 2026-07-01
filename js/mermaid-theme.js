/** Shared Mermaid theme aligned with Fonora research / grammar surfaces. */
import { isDarkTheme } from './theme.js';

export const MERMAID_INIT = {
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: '14px',
    background: '#faf8f5',
    mainBkg: '#f5edd9',
    secondBkg: '#f5f1eb',
    tertiaryBkg: '#faf8f5',
    primaryColor: '#f5edd9',
    primaryTextColor: '#2c2418',
    primaryBorderColor: '#dcc9a8',
    secondaryColor: '#f5f1eb',
    secondaryTextColor: '#3d3832',
    secondaryBorderColor: '#e0dad2',
    tertiaryColor: '#faf8f5',
    tertiaryTextColor: '#4a4540',
    tertiaryBorderColor: '#e8e2da',
    lineColor: '#c4bbb0',
    textColor: '#3d3832',
    nodeTextColor: '#2c2418',
    nodeBorder: '#dcc9a8',
    clusterBkg: '#faf8f5',
    clusterBorder: '#e0dad2',
    titleColor: '#9a7544',
    edgeLabelBackground: '#faf8f5',
  },
  securityLevel: 'loose',
};

export const MERMAID_INIT_DARK = {
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: '14px',
    background: '#1a1a1a',
    mainBkg: '#2a241c',
    secondBkg: '#222',
    tertiaryBkg: '#1a1a1a',
    primaryColor: '#2a241c',
    primaryTextColor: '#f0ede8',
    primaryBorderColor: '#8a7355',
    secondaryColor: '#222',
    secondaryTextColor: '#d4d4d4',
    secondaryBorderColor: '#444',
    tertiaryColor: '#1a1a1a',
    tertiaryTextColor: '#d4d4d4',
    tertiaryBorderColor: '#404040',
    lineColor: '#666',
    textColor: '#d4d4d4',
    nodeTextColor: '#f0ede8',
    nodeBorder: '#8a7355',
    clusterBkg: '#222',
    clusterBorder: '#444',
    titleColor: '#c4a574',
    edgeLabelBackground: '#1a1a1a',
  },
  securityLevel: 'loose',
};

/** @returns {typeof MERMAID_INIT} */
export function getMermaidInit() {
  return isDarkTheme() ? MERMAID_INIT_DARK : MERMAID_INIT;
}
