# =========================
# Stage 1: Build
# =========================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy only pom.xml first (better layer caching)
COPY pom.xml .
COPY crm-ui/package.json crm-ui/
COPY crm-ui/package-lock.json crm-ui/

# Go offline (dependencies)
RUN mvn -B -q dependency:go-offline

# Copy source and build
COPY src ./src
COPY crm-ui ./crm-ui
RUN mvn -B clean package -DskipTests

# =========================
# Stage 2: Runtime
# =========================
FROM eclipse-temurin:21-jre

# Security: non-root user
RUN useradd -r -u 1001 spring

WORKDIR /app

# Copy only the fat jar
COPY --from=builder /build/target/*.jar app.jar

# Set permissions
RUN chown -R spring:spring /app
USER spring

# JVM tuning for containers
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC"

EXPOSE 8080

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
