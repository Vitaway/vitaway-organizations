'use client';

import React, { useState } from 'react';
import { usePrograms } from '@/hooks/usePrograms';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Eye, BookOpen, Clock, Layers } from 'lucide-react';

export default function ProgramList() {
  const { programs, loading, error, pagination, fetchPrograms } = usePrograms();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    fetchPrograms(1, 20);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchPrograms(1, 20);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Learning Programs</h1>
        <p className="mt-2 text-muted-foreground">Browse available programs and explore their learning content</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search programs..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'draft', 'archived'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => handleStatusFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : programs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No programs available</p>
            <p className="text-sm text-muted-foreground mt-1">Programs will appear here once they are created.</p>
          </div>
        ) : (
          programs.map((program) => (
            <Link
              key={program.id}
              href={`/dashboard/programs/${program.id}`}
              className="group rounded-lg border bg-card p-6 hover:shadow-lg transition-all hover:border-primary/50"
            >
              {/* Thumbnail */}
              {program.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={program.thumbnail_url}
                  alt={program.title}
                  className="mb-4 h-40 w-full rounded object-cover"
                />
              )}

              {/* Content */}
              <div className="mb-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{program.title}</h3>
                  <Badge className={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {program.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-4">
                {program.difficulty_level && (
                  <Badge variant="outline" className={getDifficultyColor(program.difficulty_level)}>
                    {program.difficulty_level}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers size={14} />
                  {program.total_modules} modules
                </span>
                {program.estimated_duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {program.estimated_duration_hours}h
                  </span>
                )}
              </div>

              {/* View button */}
              <div className="mt-4 pt-4 border-t">
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Eye size={16} />
                  View Program
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.current_page === 1}
              onClick={() => fetchPrograms(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => fetchPrograms(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
