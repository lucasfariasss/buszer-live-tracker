import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusMapProps {
  latitude: number;
  longitude: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

const BusMap = ({ latitude, longitude, onLocationUpdate }: BusMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Buscar o token do Mapbox
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Erro ao buscar token do Mapbox:', error);
          toast.error('Erro ao carregar o mapa. Configure o token do Mapbox.');
          return;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Erro ao buscar token:', err);
        toast.error('Erro ao carregar o mapa');
      }
    };

    fetchMapboxToken();
  }, []);

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    if (map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 13,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Criar elemento customizado para o marcador
    const el = document.createElement('div');
    el.className = 'bus-marker';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjE4IiBmaWxsPSIjM2I4MmY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNkgxOUMxOC40NDc3IDE2IDE4IDE2LjQ0NzcgMTggMTdWMjhDMTggMjguNTUyMyAxOC40NDc3IDI5IDE5IDI5SDI3QzI3LjU1MjMgMjkgMjggMjguNTUyMyAyOCAyOFYxN0MyOCAxNi40NDc3IDI3LjU1MjMgMTYgMjcgMTZaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgMjZIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMkgyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+)';
    el.style.width = '48px';
    el.style.height = '48px';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Atualizar marcador quando a localização mudar
  useEffect(() => {
    if (!map.current || !marker.current) return;

    marker.current.setLngLat([longitude, latitude]);
    map.current.flyTo({
      center: [longitude, latitude],
      duration: 1000,
    });

    if (onLocationUpdate) {
      onLocationUpdate(latitude, longitude);
    }
  }, [latitude, longitude, onLocationUpdate]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/5" />
    </div>
  );
};

export default BusMap;
