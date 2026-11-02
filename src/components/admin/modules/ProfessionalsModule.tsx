import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Star,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Professional } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { StorageService } from '../../../services/storage';

interface ProfessionalsModuleProps {
  professionals: Professional[];
  onRefreshData: () => void;
}

export const ProfessionalsModule: React.FC<ProfessionalsModuleProps> = ({
  professionals,
  onRefreshData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [commissionRate, setCommissionRate] = useState('50');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialtiesStr, setSpecialtiesStr] = useState('');
  const [bio, setBio] = useState('');

  const handleCreatePro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim()) return;

    StorageService.addProfessional({
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: bio.trim() || 'Especialista visagista dedicada ao padrão de excelência Sra. Bela Mulher.',
      rating: 5.0,
      reviewsCount: 1,
      commissionRate: parseFloat(commissionRate) || 50,
      specialties: specialtiesStr
        ? specialtiesStr.split(',').map(s => s.trim())
        : ['Cortes', 'Tratamentos'],
      phone: phone.trim() || '(11) 98765-0000',
      email: email.trim() || 'especialista@srabélamulher.com.br',
      active: true,
    });

    onRefreshData();
    setIsModalOpen(false);
    setName('');
    setRoleTitle('');
    setBio('');
    setSpecialtiesStr('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Corpo Profissional & Especialistas
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gerencie os profissionais parceiros, especialidades e alíquotas de comissionamento.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Cadastrar Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map(pro => (
          <Card key={pro.id} padding="md" className="flex flex-col justify-between space-y-4 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#d4af37]/40 shrink-0">
                <img
                  src={pro.avatarUrl}
                  alt={pro.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-white truncate">{pro.name}</h4>
                  <span className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/15 px-2 py-0.5 rounded-full border border-[#d4af37]/30 shrink-0">
                    Comissão {pro.commissionRate}%
                  </span>
                </div>
                <p className="text-xs text-[#d4af37]">{pro.roleTitle}</p>
                <div className="flex items-center gap-1 text-xs text-amber-300">
                  <Star size={12} fill="currentColor" />
                  <span className="font-semibold">{pro.rating.toFixed(2)}</span>
                  <span className="text-neutral-500">({pro.reviewsCount} avaliações)</span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{pro.bio}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap gap-1">
                {pro.specialties.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#161622] rounded text-[10px] text-neutral-300">
                    {s}
                  </span>
                ))}
              </div>

              <span className="text-neutral-400 text-[11px] font-mono">
                {pro.phone}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: CADASTRAR PROFISSIONAL */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title="Novo Membro da Equipe"
          subtitle="Cadastre o especialista, alíquota de comissão e especialidades"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePro}>
                Salvar Especialista
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreatePro} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Gabriela Duarte"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Título / Cargo *
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  placeholder="Ex: Master Colorista"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Comissão (%) *
                </label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={e => setCommissionRate(e.target.value)}
                  placeholder="50"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Especialidades (separadas por vírgula)
              </label>
              <input
                type="text"
                value={specialtiesStr}
                onChange={e => setSpecialtiesStr(e.target.value)}
                placeholder="Ex: Mechas Criativas, Visagismo, Tratamentos"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Mini Biografia
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Trajetória, formação e técnicas autorais..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
