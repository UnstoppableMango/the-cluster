import * as os from 'os';
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
  const ignoredPatterns: RegExp[] = [];
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
    expect(files).toHaveLength(9);
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
  function act(fileName: string): RegExpMatchArray[] {
    const file = path.join('cases', fileName);
    const lines = fs.readFileSync(file, 'utf-8').split(os.EOL);
    return renovateConfig.customManagers
      .flatMap(x => x.matchStrings)
      .flatMap(p => lines.map(l => new RegExp(p, 'gm').exec(l)))
      .filter(x => x);
  }

  it('should have patterns', () => {
    const matchers = renovateConfig.customManagers.flatMap(x => x.matchStrings);

    expect(matchers.length).toBeGreaterThan(0);
  });

  it('should match yaml dep', () => {
    const groups = act('simple.yml').map(x => x.groups);

    expect(groups).toContainEqual(expect.objectContaining({
      depName: 'test',
      currentValue: '1.2.3',
    }));
  });

  it('should not match yaml dep missing depName', () => {
    const matches = act('missing-dep-name.yml');

    expect(matches).toHaveLength(0);
  });

  it('should match multiple yaml deps', () => {
    console.log(act('multiple-simple.yml'));
    const groups = act('multiple-simple.yml').map(x => x.groups);

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

  it('should capture extractVersion', () => {
    const groups = act('extract-version.yml').map(x => x.groups);

    expect(groups).toContainEqual(expect.objectContaining({
      depName: 'test',
      currentValue: '1.2.3',
      extractVersion: '^v(?<version>.*)',
    }));
  });
});
