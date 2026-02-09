[INFO] 2 errors 
[INFO] -------------------------------------------------------------
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.800 s
[INFO] Finished at: 2026-02-09T03:30:51Z
[INFO] ------------------------------------------------------------------------
Error:  Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile (default-compile) on project barber-scheduler-lambda: Compilation failure: Compilation failure: 
Error:  /home/runner/work/BarberAgenda/BarberAgenda/backend/lambda/src/main/java/com/barbershop/handler/barbers/CreateBarberHandler.java:[32,19] cannot find symbol
Error:    symbol:   method setSpecialties(body.get("[...]t<>())
Error:    location: variable barber of type com.barbershop.model.Barber
Error:  /home/runner/work/BarberAgenda/BarberAgenda/backend/lambda/src/main/java/com/barbershop/handler/barbers/UpdateBarberHandler.java:[44,31] cannot find symbol
Error:    symbol:   method setSpecialties(java.util.List<java.lang.String>)
Error:    location: variable existingBarber of type com.barbershop.model.Barber
Error:  -> [Help 1]
Error:  
Error:  To see the full stack trace of the errors, re-run Maven with the -e switch.
Error:  Re-run Maven using the -X switch to enable full debug logging.
Error:  
Error:  For more information about the errors and possible solutions, please read the following articles:
Error:  [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoFailureException
Error: Process completed with exit code 1.package com.barbershop.model;

public class Appointment {
    private String appointmentId;
    private String barberId;
    private String customerName;
    private String customerPhone;
    private long startTime;
    private long endTime;
    private String service;
    private String notes;
    private String status; // scheduled, completed, cancelled
    private long createdAt;

    public Appointment() {}

    public Appointment(String appointmentId, String barberId, String customerName, String customerPhone,
                       long startTime, long endTime, String service, String notes, String status, long createdAt) {
        this.appointmentId = appointmentId;
        this.barberId = barberId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.startTime = startTime;
        this.endTime = endTime;
        this.service = service;
        this.notes = notes;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getBarberId() { return barberId; }
    public void setBarberId(String barberId) { this.barberId = barberId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public long getStartTime() { return startTime; }
    public void setStartTime(long startTime) { this.startTime = startTime; }

    public long getEndTime() { return endTime; }
    public void setEndTime(long endTime) { this.endTime = endTime; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
