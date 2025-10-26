'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Linkedin, Github, Instagram, MapPin, Twitter, Facebook, Youtube, Globe } from 'lucide-react';
import { useContactInfo, useProfessionalInfo, useOpportunities } from '@/lib/portfolio-context';

export function Contact() {
  const contact = useContactInfo();
  const professional = useProfessionalInfo();
  const opportunities = useOpportunities();

  // Icon mapping for different social platforms
  const socialIcons: { [key: string]: any } = {
    linkedin: Linkedin,
    github: Github,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    youtube: Youtube,
    default: Globe
  };

  // Color mapping for different platforms
  const socialColors: { [key: string]: string } = {
    linkedin: 'text-blue-700',
    github: 'text-gray-800',
    instagram: 'text-pink-600',
    twitter: 'text-blue-400',
    facebook: 'text-blue-600',
    youtube: 'text-red-600',
    default: 'text-gray-600'
  };

  // Function to format platform name for display
  const formatPlatformName = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Build basic contact info array
  const basicContactInfo = [
    ...(contact.email ? [{
      icon: <Mail className="h-5 w-5" />,
      title: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
      color: 'text-blue-600'
    }] : []),
    ...(contact.phone ? [{
      icon: <Phone className="h-5 w-5" />,
      title: 'Phone',
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, '')}`,
      color: 'text-green-600'
    }] : []),
    ...(contact.location ? [{
      icon: <MapPin className="h-5 w-5" />,
      title: 'Location',
      value: contact.location,
      href: '#',
      color: 'text-purple-600'
    }] : [])
  ];

  // Build social media contact info from dynamic social object
  const socialContactInfo = Object.entries(contact.social || {}).map(([platform, platformData]) => {
    const IconComponent = socialIcons[platform.toLowerCase()] || socialIcons.default;
    return {
      icon: <IconComponent className="h-5 w-5" />,
      title: formatPlatformName(platform),
      value: platformData.username,
      href: platformData.url,
      color: socialColors[platform.toLowerCase()] || socialColors.default
    };
  });

  // Combine all contact info
  const allContactInfo = [...basicContactInfo, ...socialContactInfo];

  // If no contact info is available, show a message
  if (allContactInfo.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Get in Touch</h2>
        <div className="bg-accent rounded-lg p-6">
          <p className="text-muted-foreground">
            Contact information is not currently available. Please check back later!
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Get in Touch</h2>
        <p className="text-muted-foreground">
          I'm always excited to connect with fellow tech enthusiasts, discuss opportunities, or just chat about the latest in AI and data science!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allContactInfo.map((contactItem, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-100 ${contactItem.color}`}>
                  {contactItem.icon}
                </div>
                <CardTitle className="text-lg">{contactItem.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base font-medium mb-3">
                {contactItem.value}
              </CardDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  if (contactItem.href !== '#') {
                    window.open(contactItem.href, '_blank');
                  }
                }}
              >
                {contactItem.title === 'Location' ? 'View on Map' : `Open ${contactItem.title}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4 pt-6">
        <div className="bg-accent rounded-lg p-6">
          <h3 className="font-semibold mb-2">What I'm Looking For</h3>
          <p className="text-sm text-muted-foreground">
            {opportunities.looking_for.map((item, index) => (
              <span key={index}>
                • {item}
                {index < opportunities.looking_for.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Feel free to reach out for collaborations, job opportunities, or just to discuss the latest in tech! 
          I'm particularly interested in projects that combine AI/ML with real-world impact.
        </p>
      </div>
    </div>
  );
}
