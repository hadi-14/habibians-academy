import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Courses'
};

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return children;
}
