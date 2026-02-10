import subprocess
import sys

try:
    result = subprocess.run(
        ['git', 'commit', '--allow-empty', '-m', 'Empty commit'],
        cwd='/vercel/share/v0-project',
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        sys.exit(result.returncode)
    print('Empty commit created successfully')
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
