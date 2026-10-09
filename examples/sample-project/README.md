# Sample project

A tiny JavaScript file with a **deliberate** problem (a hard-coded password in a
login check) so you have something to scan and see in the dashboard.

Scan it with the SonarScanner Docker image, from the repository root.

Windows (PowerShell):

```powershell
docker run --rm `
  -e SONAR_HOST_URL=http://host.docker.internal:9000 `
  -e SONAR_TOKEN=<your token> `
  -v "${PWD}/examples/sample-project:/usr/src" `
  sonarsource/sonar-scanner-cli
```

macOS / Linux (on Linux, use `--network host` and `http://localhost:9000` instead):

```bash
docker run --rm \
  -e SONAR_HOST_URL=http://host.docker.internal:9000 \
  -e SONAR_TOKEN=<your token> \
  -v "$(pwd)/examples/sample-project:/usr/src" \
  sonarsource/sonar-scanner-cli
```

Then pick **Sample Project** in the dashboard's project selector.
