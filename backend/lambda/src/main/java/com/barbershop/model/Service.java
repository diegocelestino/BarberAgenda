package com.barbershop.model;

public class Service {
    private String serviceId;
    private String title;
    private String name;
    private String description;
    private double price;
    private int duration;
    private int durationMinutes;
    private long createdAt;

    public Service() {}

    public Service(String serviceId, String title, String name, String description, 
                   double price, int duration, int durationMinutes, long createdAt) {
        this.serviceId = serviceId;
        this.title = title;
        this.name = name;
        this.description = description;
        this.price = price;
        this.duration = duration;
        this.durationMinutes = durationMinutes;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
