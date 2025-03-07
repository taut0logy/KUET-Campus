"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClubCard({ club }) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-bold">{club.name}</CardTitle>
        {club.description && (
          <CardDescription className="text-sm text-muted-foreground">
            {club.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {club.coverPhoto && (
          <img
            src={club.coverPhoto}
            alt={club.name}
            className="rounded-md w-full h-48 object-cover mb-4"
          />
        )}
        <div className="flex items-center justify-between text-sm">
          <span>
            Founded: {new Date(club.foundingDate).toLocaleDateString()}
          </span>
          {club.clubTag && (
            <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
              {club.clubTag.name}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button variant="outline" onClick={() => window.location.href = `/clubs/${club.id}`}>
          View Club
        </Button>
      </CardFooter>
    </Card>
  );
}
