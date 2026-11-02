import React, { useState } from 'react';
import { Vitrine } from '../../../types';

export const VitrinesModule: React.FC = () => {
  const [vitrines, setVitrines] = useState<Vitrine[]>([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gold">Gestão de Vitrines</h2>
      <p className="text-gray-400">Sistema em preparação. Aguardando estrutura do Supabase.</p>
      {/* TODO: Implementar UI de listagem e criação */}
    </div>
  );
};
