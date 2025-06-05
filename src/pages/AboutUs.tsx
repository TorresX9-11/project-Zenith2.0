import React from 'react';
import { Clock, Target, Users, Award, BookOpen, Brain } from 'lucide-react';

const DEFAULT_PROFILE_IMAGE = "/src/pages/assetsImg/imgPerfil/default/defaultProfile.svg";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  imageUrl?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Emanuel Torres",
    role: "Desarrollador Backend",
    description: "Apasionado por la optimización de procesos y la creación de APIs eficientes.",
    imageUrl: "/src/pages/assetsImg/imgPerfil/EmanuelTorres/imgPerfil.jpg"
  },
  {
    name: "John Alvarez",
    role: "Desarrollador Frontend",
    description: "Especialista en crear experiencias de usuario intuitivas y atractivas.",
    imageUrl: "/src/pages/assetsImg/imgPerfil/JohnAlvarez/imgPerfil.jpg"
  },
  {
    name: "Gabriel Ramirez",
    role: "Diseñador",
    description: "Creativo y detallista, enfocado en la estética y funcionalidad de la aplicación.",
    imageUrl: "/src/pages/assetsImg/imgPerfil/GabrielRamirez/imgPerfil.jpg"
  }
];

const AboutUs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-8 mb-12">
        <h1 className="text-4xl font-bold text-center mb-4">Sobre Nosotros</h1>
        <p className="text-xl text-center text-primary-100">Transformando la gestión del tiempo en el mundo académico</p>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-primary-600" size={24} />
          <span>Nuestra Historia</span>
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-lg mb-4">
            Zenith nació en mayo de 2024 de la visión de un grupo de estudiantes universitarios
            que experimentaron de primera mano los desafíos de equilibrar la vida académica
            con otras actividades importantes.
          </p>
          <p className="text-lg mb-4">
            Entendiendo que el tiempo es uno de nuestros recursos más valiosos,
            especialmente durante la etapa universitaria, desarrollamos una herramienta
            que no solo ayuda a organizar el tiempo, sino que también promueve un
            equilibrio saludable entre estudio, ejercicio y descanso.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Target className="text-primary-600" size={24} />
          <span>Nuestra Misión</span>
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-lg mb-4">
            Nuestra misión es empoderar a los estudiantes universitarios con herramientas
            inteligentes que les permitan maximizar su potencial académico mientras
            mantienen un estilo de vida equilibrado y saludable.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Award className="text-primary-600" size={24} />
          <span>Nuestros Valores</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="text-primary-600" size={20} />
              <h3 className="font-semibold">Excelencia Académica</h3>
            </div>
            <p className="text-neutral-600">
              Promovemos el alto rendimiento académico a través de una gestión efectiva del tiempo.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="text-primary-600" size={20} />
              <h3 className="font-semibold">Innovación</h3>
            </div>
            <p className="text-neutral-600">
              Utilizamos tecnología avanzada para ofrecer soluciones inteligentes y personalizadas.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-primary-600" size={20} />
              <h3 className="font-semibold">Comunidad</h3>
            </div>
            <p className="text-neutral-600">
              Construimos una comunidad de estudiantes comprometidos con su desarrollo personal.
            </p>
          </div>
        </div>
      </section>      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Users className="text-primary-600" size={24} />
          <span>Nuestro Equipo</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">              <div className="w-24 h-24 mx-auto mb-4 relative">
                <img
                  src={member.imageUrl || DEFAULT_PROFILE_IMAGE}
                  alt={`Foto de ${member.name}`}
                  className="w-full h-full rounded-full object-cover border-2 border-primary-200"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{member.name}</h3>
              <p className="text-center text-neutral-600 mb-2">{member.role}</p>
              <p className="text-center text-sm text-neutral-500">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
