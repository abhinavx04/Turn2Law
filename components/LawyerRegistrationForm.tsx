"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TimeSlot {
  start: string;
  end: string;
}

interface LawyerFormData {
  name: string;
  specializations: string[];
  experienceYears: number;
  hourlyRate: number;
  bio: string;
  barCouncilNumber: string;
  availableHours: {
    [key: string]: TimeSlot[];
  };
  location: string;
  languages: string[];
  education: string[];
}

const INITIAL_STATE: LawyerFormData = {
  name: "",
  specializations: [],
  experienceYears: 0,
  hourlyRate: 0,
  bio: "",
  barCouncilNumber: "",
  availableHours: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: []
  },
  location: "",
  languages: [],
  education: []
};

const SUGGESTED_SPECIALIZATIONS = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Corporate Law",
  "Real Estate",
  "Intellectual Property",
  "Immigration",
  "Tax Law"
];

export function LawyerRegistrationForm() {
  const [formData, setFormData] = useState<LawyerFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/lawyers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Profile created successfully!");
      router.push("/dashboard");
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = (spec: string) => {
    if (!formData.specializations.includes(spec)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, spec]
      }));
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  const addTimeSlot = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableHours: {
        ...prev.availableHours,
        [day]: [...prev.availableHours[day], { start: "09:00", end: "17:00" }]
      }
    }));
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      availableHours: {
        ...prev.availableHours,
        [day]: prev.availableHours[day].map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      availableHours: {
        ...prev.availableHours,
        [day]: prev.availableHours[day].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto p-6 bg-gray-800 text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">Create Your Lawyer Profile</h2>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-700 text-white border-gray-600"
              required
            />
            <Input
              placeholder="Bar Council Number"
              value={formData.barCouncilNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, barCouncilNumber: e.target.value }))}
              className="bg-gray-700 text-white border-gray-600"
              required
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium mb-2">Specializations</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.specializations.map(spec => (
                <Badge
                  key={spec}
                  className="bg-teal-400/20 text-teal-400 hover:bg-teal-400/30 cursor-pointer"
                  onClick={() => removeSpecialization(spec)}
                >
                  {spec} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SPECIALIZATIONS.filter(spec => !formData.specializations.includes(spec))
                .map(spec => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-700"
                    onClick={() => addSpecialization(spec)}
                  >
                    {spec}
                  </Badge>
                ))
              }
            </div>
          </div>

          {/* Experience and Rate */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Years of Experience"
              value={formData.experienceYears || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
              className="bg-gray-700 text-white border-gray-600"
              required
            />
            <Input
              type="number"
              placeholder="Hourly Rate (₹)"
              value={formData.hourlyRate || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
              className="bg-gray-700 text-white border-gray-600"
              required
            />
          </div>

          {/* Bio */}
          <Textarea
            placeholder="Professional Bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="bg-gray-700 text-white border-gray-600 min-h-[120px]"
            required
          />

          {/* Available Hours */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">Available Hours</label>
            {Object.entries(formData.availableHours).map(([day, slots]) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{day}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTimeSlot(day)}
                    className="text-teal-400 hover:text-teal-300"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Time Slot
                  </Button>
                </div>
                <div className="space-y-2">
                  {slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(day, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-400 hover:bg-teal-500 text-black"
          disabled={loading}
        >
          {loading ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>
    </Card>
  );
}