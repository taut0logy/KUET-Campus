"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Calendar, Clock, Link, Plus, Trash2, X } from 'lucide-react';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { getClubBySlug, getEventTags, createEvent } from '@/lib/api/clubsApi';
import { useSession } from 'next-auth/react';

// Validation schema
const eventFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  coverPhoto: z.string().optional(),
  tags: z.array(z.string()).min(1, 'Select at least one tag'),
  eventLinks: z.array(z.object({
    name: z.string().min(1, 'Link name is required'),
    url: z.string().url('Must be a valid URL')
  })).optional()
});


export default function CreateEventPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  
  const [club, setClub] = useState<any>(null);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0], // Today's date as default
      startTime: '18:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '20:00',
      coverPhoto: '',
      tags: [],
      eventLinks: [{ name: '', url: '' }]
    }
  });
  
  // For event links field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'eventLinks',
  });
  
  // Load club and tags data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [clubData, tagsData] = await Promise.all([
          getClubBySlug(slug),
          getEventTags()
        ]);
        
        setClub(clubData.club);
        setTags(tagsData.tags || []);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [slug, toast]);
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Process form data
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
      
      // Validate end time is after start time
      if (endDateTime <= startDateTime) {
        toast({
          title: "Invalid time range",
          description: "End time must be after start time",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Filter out empty event links
      const eventLinks = data.eventLinks?.filter(
        link => link.name.trim() !== '' && link.url.trim() !== ''
      ) || [];
      
      const eventData = {
        name: data.name,
        description: data.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        clubId: club.id,
        coverPhoto: data.coverPhoto || null,
        tags: data.tags,
        eventLinks
      };
      
      const result = await createEvent(eventData);
      
      toast({
        title: "Event Created",
        description: `${data.name} has been scheduled successfully`
      });
      
      // Redirect to the event page
      router.push(`/events/${result.event.slug}`);
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Ensure user has permission to create events for this club
  useEffect(() => {
    if (!isLoading && club && session?.user) {
      const userId = session.user.id;
      const isModeratorOrManager = 
        club.moderatorId === userId || 
        club.userRole === 'MANAGER' || 
        (session.user.roles && session.user.roles.includes('ADMIN'));
      
      if (!isModeratorOrManager) {
        toast({
          title: "Access denied",
          description: "You don't have permission to create events for this club",
          variant: "destructive"
        });
        router.push(`/clubs/${slug}`);
      }
    }
  }, [isLoading, club, session, router, slug, toast]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Calendar className="h-8 w-8 mr-2" />
          Create New Event
        </h1>
        <p className="text-muted-foreground mt-1">
          for {club?.name}
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your event" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about what attendees can expect
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Cover Photo URL */}
              <FormField
                control={form.control}
                name="coverPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Photo URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an image for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Tags</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          // Only add the tag if it's not already selected
                          if (!field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tags" />
                        </SelectTrigger>
                        <SelectContent>
                          {tags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.id.toString()}>
                              {tag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((tagId) => {
                        const tag = tags.find((t) => t.id.toString() === tagId);
                        return (
                          <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                            {tag?.name || tagId}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                field.onChange(field.value.filter((id) => id !== tagId));
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Event Links (optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', url: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`eventLinks.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Link name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`eventLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Event
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
