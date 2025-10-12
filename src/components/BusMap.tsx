import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BusMapProps {
  latitude: number;
  longitude: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

const BusMap = ({ latitude, longitude, onLocationUpdate }: BusMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    // Criar o mapa
    map.current = L.map(mapContainer.current, {
      center: [latitude, longitude],
      zoom: 13,
      zoomControl: false, // Desabilitar controle padrão para reposicioná-lo
    });

    // Adicionar tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Adicionar controle de zoom customizado posicionado
    const zoomControl = L.control.zoom({
      position: 'topright',
    });
    zoomControl.addTo(map.current);

    // Ajustar posição dos controles via CSS para ficarem abaixo do cartão
    setTimeout(() => {
      const zoomElement = document.querySelector('.leaflet-top.leaflet-right') as HTMLElement;
      if (zoomElement) {
        zoomElement.style.top = '270px';
      }
    }, 100);

    // Criar ícone customizado para o marcador
    const busIcon = L.divIcon({
      className: 'bus-marker',
      html: `<div style="
        width: 48px;
        height: 48px;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjE4IiBmaWxsPSIjM2I4MmY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNkgxOUMxOC40NDc3IDE2IDE4IDE2LjQ0NzcgMTggMTdWMjhDMTggMjguNTUyMyAxOC40NDc3IDI5IDE5IDI5SDI3QzI3LjU1MjMgMjkgMjggMjguNTUyMyAyOCAyOFYxN0MyOCAxNi40NDc3IDI3LjU1MjMgMTYgMjcgMTZaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgMjZIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMkgyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+');
        background-size: cover;
        cursor: pointer;
      "></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    // Adicionar marcador
    marker.current = L.marker([latitude, longitude], {
      icon: busIcon,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Atualizar marcador quando a localização mudar
  useEffect(() => {
    if (!map.current || !marker.current) return;

    marker.current.setLatLng([latitude, longitude]);
    map.current.flyTo([latitude, longitude], 13, {
      duration: 1,
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
