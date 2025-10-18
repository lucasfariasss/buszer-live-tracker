import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  atualizado_em: string;
}

interface BusMapProps {
  buses: BusData[];
  selectedBusId: number;
  onSelectBus: (id: number) => void;
}

const BusMap = ({ buses, selectedBusId, onSelectBus }: BusMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Map<number, L.Marker>>(new Map());

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (!selectedBus) return;

    // Criar o mapa
    map.current = L.map(mapContainer.current, {
      center: [selectedBus.latitude, selectedBus.longitude],
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

    // Criar ícone customizado para o marcador (comum a todos)
    const createBusIcon = (isSelected: boolean) => L.divIcon({
      className: 'bus-marker',
      html: `<div style="
        width: 48px;
        height: 48px;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjE4IiBmaWxsPSIjM2I4MmY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNkgxOUMxOC40NDc3IDE2IDE4IDE2LjQ0NzcgMTggMTdWMjhDMTggMjguNTUyMyAxOC40NDc3IDI5IDE5IDI5SDI3QzI3LjU1MjMgMjkgMjggMjguNTUyMyAyOCAyOFYxN0MyOCAxNi40NDc3IDI3LjU1MjMgMTYgMjcgMTZaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgMjZIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMkgyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+');
        background-size: cover;
        cursor: pointer;
        opacity: ${isSelected ? '1' : '0.6'};
        transform: scale(${isSelected ? '1' : '0.85'});
        transition: all 0.3s ease;
      "></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    // Adicionar marcadores para todos os ônibus
    buses.forEach(bus => {
      const icon = createBusIcon(bus.id === selectedBusId);
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(map.current!);
      
      // Adicionar popup ao marcador
      const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const updated = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Agora mesmo';
        if (diffInMinutes === 1) return '1 min atrás';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours === 1) return '1 hora atrás';
        return `${diffInHours} horas atrás`;
      };

      const isRecentlyUpdated = (timestamp: string) => {
        const now = new Date();
        const updated = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
        return diffInMinutes < 2;
      };

      const popupContent = `
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1e293b;">
            ${bus.nome}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isRecentlyUpdated(bus.atualizado_em) ? '#22c55e' : '#94a3b8'};"></div>
            <span style="font-size: 12px; font-weight: 500; color: ${isRecentlyUpdated(bus.atualizado_em) ? '#22c55e' : '#64748b'};">
              ${isRecentlyUpdated(bus.atualizado_em) ? 'Ao Vivo' : 'Offline'}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">
            <strong>Latitude:</strong> ${bus.latitude.toFixed(6)}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            <strong>Longitude:</strong> ${bus.longitude.toFixed(6)}
          </div>
          <div style="font-size: 11px; color: #94a3b8;">
            Atualizado ${getTimeAgo(bus.atualizado_em)}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'bus-popup'
      });

      // Ao clicar no marcador, selecionar o ônibus
      marker.on('click', () => {
        onSelectBus(bus.id);
      });
      
      markers.current.set(bus.id, marker);
    });

    return () => {
      // Remover todos os marcadores
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      
      // Remover e limpar o mapa
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Atualizar marcadores quando os dados dos ônibus mudarem
  useEffect(() => {
    if (!map.current) return;

    // Verificar se o mapa ainda é válido
    try {
      map.current.getZoom();
    } catch {
      return;
    }

    const createBusIcon = (isSelected: boolean) => L.divIcon({
      className: 'bus-marker',
      html: `<div style="
        width: 48px;
        height: 48px;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjE4IiBmaWxsPSIjM2I4MmY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNkgxOUMxOC40NDc3IDE2IDE4IDE2LjQ0NzcgMTggMTdWMjhDMTggMjguNTUyMyAxOC40NDc3IDI5IDE5IDI5SDI3QzI3LjU1MjMgMjkgMjggMjguNTUyMyAyOCAyOFYxN0MyOCAxNi40NDc3IDI3LjU1MjMgMTYgMjcgMTZaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgMjZIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMkgyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+');
        background-size: cover;
        cursor: pointer;
        opacity: ${isSelected ? '1' : '0.6'};
        transform: scale(${isSelected ? '1' : '0.85'});
        transition: all 0.3s ease;
      "></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const getTimeAgo = (timestamp: string) => {
      const now = new Date();
      const updated = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Agora mesmo';
      if (diffInMinutes === 1) return '1 min atrás';
      if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours === 1) return '1 hora atrás';
      return `${diffInHours} horas atrás`;
    };

    const isRecentlyUpdated = (timestamp: string) => {
      const now = new Date();
      const updated = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
      return diffInMinutes < 2;
    };

    buses.forEach(bus => {
      const marker = markers.current.get(bus.id);
      if (marker) {
        marker.setLatLng([bus.latitude, bus.longitude]);
        marker.setIcon(createBusIcon(bus.id === selectedBusId));
        
        // Atualizar conteúdo do popup
        const popupContent = `
          <div style="font-family: system-ui; min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1e293b;">
              ${bus.nome}
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isRecentlyUpdated(bus.atualizado_em) ? '#22c55e' : '#94a3b8'};"></div>
              <span style="font-size: 12px; font-weight: 500; color: ${isRecentlyUpdated(bus.atualizado_em) ? '#22c55e' : '#64748b'};">
                ${isRecentlyUpdated(bus.atualizado_em) ? 'Ao Vivo' : 'Offline'}
              </span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">
              <strong>Latitude:</strong> ${bus.latitude.toFixed(6)}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              <strong>Longitude:</strong> ${bus.longitude.toFixed(6)}
            </div>
            <div style="font-size: 11px; color: #94a3b8;">
              Atualizado ${getTimeAgo(bus.atualizado_em)}
            </div>
          </div>
        `;
        
        marker.getPopup()?.setContent(popupContent);
      }
    });
  }, [buses, selectedBusId]);

  // Centralizar no ônibus selecionado
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    
    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (selectedBus) {
      try {
        m.flyTo([selectedBus.latitude, selectedBus.longitude], 13, {
          duration: 1,
        });
      } catch (error) {
        console.warn('Erro ao centralizar mapa:', error);
      }
    }
  }, [selectedBusId]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default BusMap;
