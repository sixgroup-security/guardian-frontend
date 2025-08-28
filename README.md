# Guardian React

Guardian React is the front-end for the offensive security reporting engine [Guardian](https://github.com/chopicalqui/guardian-backend).

# Setup

Review the content of file [common.ts](./util/consts/common.ts).

| **Ref.** | **Variable**          | **Meaning**                                                                                      |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| 1        | `APP_API_URL`         | Contains the base URL to the back-end REST API.                                                  |
| 2        | `APP_INVENTORY_URL`   | If set, the application's data grid inserts a link to the application inventory web application. |
| 3        | `CVSS_CALCULATOR_URL` | Contains the URL to the online CVSS calculator used during reporting.                            |

You can start the development environment by executing the following command:

```
npm run dev
```

If the Guardian back-end application is already running, then Guardian UI is accessible via Guardian's reverse proxy at:

http://localhost:8000

# Build and Run Docker

The following command builds a Docker image for Guardian React:

```
API_URL=http://localhost:9000
INVENTORY_URL=https://inventory.localhost/api
CVSS_CALCULATOR_URL=https://www.first.org/cvss/calculator/4.0
docker build -f docker/Dockerfile -t guardian-react --build-arg API_URL="$API_URL" --build-arg INVENTORY_URL="$INVENTORY_URL" --build-arg CVSS_CALCULATOR_URL="$CVSS_CALCULATOR_URL" .
```

We can start the Docker image using the following command:

```
docker run -p 9000:9000 --rm --name guardian-react guardian-react:latest
```
