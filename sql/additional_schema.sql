-- SQL Schema for additional tables

-- Using ENUM types for roles and status for data integrity
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'deleted');

-- Content Metadata (can be linked to various content types)
CREATE TABLE content_metadata (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- e.g., 'success_story', 'blog_post'
    content_id INT NOT NULL,
    seo_title VARCHAR(255),
    seo_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Activity Logs for auditing
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT, -- Can't add a foreign key constraint as admin_users table is not defined here
    action VARCHAR(255) NOT NULL, -- e.g., 'create_post', 'delete_user'
    target_type VARCHAR(50),
    target_id INT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Library
CREATE TABLE media_library (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL UNIQUE,
    file_type VARCHAR(50),
    file_size_kb INT,
    alt_text TEXT,
    uploaded_by_id INT, -- Can't add a foreign key constraint as admin_users table is not defined here
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Soft Deletes: A generic table to track deleted items
-- This provides a unified way to restore content.
CREATE TABLE soft_deleted_items (
    id SERIAL PRIMARY KEY,
    original_table_name VARCHAR(100) NOT NULL,
    item_id INT NOT NULL,
    item_data JSONB, -- Store the data of the deleted row
    deleted_by_id INT, -- Can't add a foreign key constraint as admin_users table is not defined here
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SQL Schema for the Impact Module

CREATE TABLE success_stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    featured_image_url VARCHAR(255),
    video_url VARCHAR(255),
    quote TEXT,
    category VARCHAR(100),
    year INT,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE research_publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    authors TEXT[], -- Array of author names
    publication_date DATE,
    publication_type VARCHAR(100), -- journal paper, report, white paper
    document_url VARCHAR(255),
    external_link VARCHAR(255),
    year INT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE annual_reports (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary_highlights TEXT,
    pdf_url VARCHAR(255) NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- SQL Schema for the Get Involved Module

CREATE TABLE partnership_inquiries (
    id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255),
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    partnership_type VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, closed
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE volunteer_submissions (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    volunteer_role_id INT,
    availability TEXT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE volunteer_roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    time_commitment VARCHAR(100),
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SQL Schema for the News & Events Module

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    author_id INT, -- Foreign key to users table
    body TEXT NOT NULL,
    featured_image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    virtual_link VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, past, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_gallery_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    media_url VARCHAR(255) NOT NULL,
    media_type VARCHAR(20) NOT NULL, -- image, video
    album_id INT,
    display_order INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
