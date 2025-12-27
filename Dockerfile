# =========================
# Stage 1: Build
# =========================
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /build

# Copy only pom.xml first (better layer caching)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source and build
COPY src ./src
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
