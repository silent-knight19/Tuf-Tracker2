import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Button from './Button.jsx';
import Badge from './Badge.jsx';
import Card from './Card.jsx';
import Input from './Input.jsx';

describe('UI Primitives (UI-1 Design System)', () => {
  it('renders Button with primary variant styles', () => {
    const html = renderToString(React.createElement(Button, { variant: 'primary' }, 'Run Code'));
    expect(html).toContain('bg-primary');
    expect(html).toContain('Run Code');
  });

  it('renders Button with disabled and loading state', () => {
    const html = renderToString(React.createElement(Button, { isLoading: true, disabled: true }, 'Running'));
    expect(html).toContain('disabled');
    expect(html).toContain('animate-spin');
  });

  it('renders Badge with easy difficulty variant and dot', () => {
    const html = renderToString(React.createElement(Badge, { variant: 'easy', dot: true }, 'Easy'));
    expect(html).toContain('bg-difficulty-easy/10');
    expect(html).toContain('Easy');
    expect(html).toContain('rounded-full');
  });

  it('renders Badge with hard difficulty variant', () => {
    const html = renderToString(React.createElement(Badge, { variant: 'hard' }, 'Hard'));
    expect(html).toContain('bg-difficulty-hard/10');
    expect(html).toContain('Hard');
  });

  it('renders Card with obsidian styling and inner rim highlight', () => {
    const html = renderToString(React.createElement(Card, { interactive: true }, 'Card Content'));
    expect(html).toContain('bg-surface-raised');
    expect(html).toContain('shadow-inner-rim');
    expect(html).toContain('Card Content');
  });

  it('renders Input with placeholder and shortcut badge', () => {
    const html = renderToString(React.createElement(Input, { placeholder: 'Search...', shortcut: '⌘K' }));
    expect(html).toContain('placeholder="Search..."');
    expect(html).toContain('⌘K');
  });
});
