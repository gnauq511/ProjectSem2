@echo off
echo Setting up PayPal environment variables...

set PAYPAL_MODE=sandbox
set PAYPAL_CLIENT_ID=AbB5jUcevpsGedVppZoYRowiCXjyWrVAxam8HSH05QmwSIK6A9J-O-cWn1fw72ucULfZUKOGrPHTjeo4
set PAYPAL_CLIENT_SECRET=EGlCJjifjOatvuzcB5j1_eijGll6_cqX6O2nSJOhRv3NmIM5A80buU8lSpalug5rma0mNS2cdGMo7LLd

echo Environment variables set. Starting application...

:: Run the Spring Boot application
mvnw.cmd spring-boot:run

pause
