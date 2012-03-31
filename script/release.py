# -*- coding: utf-8 -*-

import json
from optparse import OptionParser
import os
import zipfile


here = os.path.abspath(os.path.dirname(__file__))
project_root = os.path.join(here, '..')
extension_root = os.path.join(project_root, 'extension')

manifest_file = os.path.join(extension_root, 'manifest.json')
zip_file = os.path.join(project_root, 'extension.zip')


def bump_up(version):
    print('bump up verion to {0}'.format(version))

    with open(manifest_file, 'r') as f:
        manifest = json.load(f)

    manifest['version'] = version

    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2, encoding='utf-8')

    print('done.')


def archive():
    print('generate an archive file...')

    zip_archive = zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk(extension_root):
	for name in files:
            zip_archive.write(os.path.join(root, name))
    zip_archive.close()

    print('done.')


def main():
    parser = OptionParser(usage='%prog [version]')
    options, args = parser.parse_args()
    if len(args) > 1:
        parser.error('wrong number of arguments.')

    if args:
        version = args[0]
        bump_up(version)

    archive()


if __name__ == '__main__':
    main()
