-- CreateTable
CREATE TABLE "driver_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lineId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bus_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops_on_lines" (
    "id" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "stops_on_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "stopOnLineId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_locations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bus_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "driver_codes_code_key" ON "driver_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_codeId_idx" ON "sessions"("codeId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "bus_lines_name_key" ON "bus_lines"("name");

-- CreateIndex
CREATE INDEX "stops_latitude_longitude_idx" ON "stops"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "stops_on_lines_lineId_order_idx" ON "stops_on_lines"("lineId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "stops_on_lines_stopId_lineId_key" ON "stops_on_lines"("stopId", "lineId");

-- CreateIndex
CREATE INDEX "routes_lineId_idx" ON "routes"("lineId");

-- CreateIndex
CREATE INDEX "route_stops_routeId_idx" ON "route_stops"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_routeId_order_key" ON "route_stops"("routeId", "order");

-- CreateIndex
CREATE INDEX "bus_locations_sessionId_idx" ON "bus_locations"("sessionId");

-- CreateIndex
CREATE INDEX "bus_locations_lineId_timestamp_idx" ON "bus_locations"("lineId", "timestamp");

-- CreateIndex
CREATE INDEX "bus_locations_latitude_longitude_idx" ON "bus_locations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "bus_locations_timestamp_idx" ON "bus_locations"("timestamp");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "driver_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops_on_lines" ADD CONSTRAINT "stops_on_lines_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops_on_lines" ADD CONSTRAINT "stops_on_lines_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_stopOnLineId_fkey" FOREIGN KEY ("stopOnLineId") REFERENCES "stops_on_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_locations" ADD CONSTRAINT "bus_locations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_locations" ADD CONSTRAINT "bus_locations_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
