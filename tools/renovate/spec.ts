import * as fs from 'fs';
import * as path from 'path';

interface CustomManager {
  fileMatch?: string[];
  matchStrings?: string[];
}

interface RenovateConfig {
  customManagers: CustomManager[];
}

let renovateConfig: RenovateConfig = {
  customManagers: [],
};

beforeAll(() => {
  renovateConfig = JSON.parse(
    fs.readFileSync('../../.github/renovate.json', 'utf-8'),
  );
});

describe('regex manager fileMatch', () => {
  const ignoredPatterns: RegExp[] = [/yaml\//];
  let files: string[] = [];
  let patterns: RegExp[] = [];
  let matches: string[] = [];

  beforeAll(() => {
    files = fs.readdirSync('cases', {
      encoding: 'utf-8',
      withFileTypes: true,
      recursive: true,
    })
      .filter(x => x.isFile())
      .map(x => path.join(x.path, x.name))
      .filter(x => !ignoredPatterns.some(p => p.test(x)))
      .map(x => path.relative('cases', x));

    patterns = renovateConfig.customManagers.flatMap(x => x.fileMatch.map(f => new RegExp(f)));
    matches = files.filter(x => patterns.some(p => p.test(x)));
  });

  it('should match files', () => {
    expect(files).toHaveLength(5);
  });

  it('should match github workflows', () => {
    const expected = [
      path.join('.github', 'workflows', 'main.yml'),
      path.join('.github', 'workflows', 'main.yaml'),
    ];

    expect(matches).toEqual(expect.arrayContaining(expected));
  });

  it('should match github actions', () => {
    const expected = [
      path.join('.github', 'actions', 'some-action', 'action.yml'),
      path.join('.github', 'actions', 'some-other-action', 'action.yaml'),
    ];

    expect(matches).toEqual(expect.arrayContaining(expected));
  });

  it('should match Pulumi.yaml files', () => {
    expect(matches).toContain(path.join('apps', 'test-app', 'Pulumi.yaml'));
  });
});

describe('regex manager matchStrings', () => {
  let patterns: RegExp[] = []

  beforeAll(() => {
    patterns = renovateConfig.customManagers.flatMap(x => x.matchStrings.map(m => new RegExp(m, 'gm')));
  });

  it('should have patterns', () => {
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('should match yaml dep', () => {
    const dep = fs.readFileSync(path.join('cases', 'yaml', 'simple.yml'), 'utf-8');

    const groups = patterns.map(x => x.exec(dep).groups);

    expect(groups).toContainEqual(expect.objectContaining({
      depName: 'test',
      currentValue: '1.2.3',
    }));
  });

  it('should not match yaml dep missing depName', () => {
    const dep = fs.readFileSync(path.join('cases', 'yaml', 'missing-dep-name.yml'), 'utf-8');

    const actual = patterns.reduce((p, c) => p || c.test(dep), false);

    expect(actual).toBeFalsy();
  });

  it('should match multiple yaml deps', () => {
    const dep = fs.readFileSync(path.join('cases', 'yaml', 'multiple-simple.yml'), 'utf-8');

    const groups = patterns.map(x => x.exec(dep).groups);

    expect(groups).toEqual(expect.arrayContaining([
      {
        depName: 'test',
        currentValue: '1.2.3',
      },
      {
        depName: 'test2',
        currentValue: '3.2.1',
      },
    ]));
  });
});
