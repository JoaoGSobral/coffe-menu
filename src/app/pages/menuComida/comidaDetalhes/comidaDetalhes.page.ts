import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { starOutline, cartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  CarrinhoService,
  ItemCarrinho,
} from 'src/app/services/carrinho.service';

@Component({
  selector: 'app-comida-detalhes',
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  templateUrl: './comidaDetalhes.page.html',
  styleUrls: ['./comidaDetalhes.page.scss'],
})
export class ComidaDetalhesPage implements OnInit {
  comida: any;
  preco: string | null = null;
  descricaoSelecionada: any = null;
  volumeSelecionado: string | null = null;
  tamanhoSelecionado: string = '';
  tamanhos = ['Pequeno', 'Médio', 'Grande'];
  estaNoCarrinho: boolean = false;

  // 🍰 Descrições e avaliações personalizadas
  descricaoPersonalizada: any = {
    'Apple Frangipan Tart': {
      descricao:
        'Pão dourado e fofinho recheado com omelete leve e temperada, perfeito para começar o dia com sabor e energia.',
      avaliacao: 4.5,
    },
    'Battenberg Cake': {
      descricao:
        'Camadas fofinhas de bolo amanteigado nas cores rosa e amarela, envoltas em uma fina camada de marzipã. Um clássico britânico cheio de charme!',
      avaliacao: 4.6,
    },
    'Fruit and Cream Cheese Breakfast Pastries': {
      descricao:
        'Massa folhada delicada, recheada com cream cheese cremoso e frutas frescas — uma combinação irresistível de doçura e leveza.',
      avaliacao: 4.9,
    },
    'Blueberry & lemon friands': {
      descricao:
        'Bolinhos delicados com mirtilos suculentos e toque cítrico de limão, macios por dentro e levemente crocantes por fora.',
      avaliacao: 4.8,
    },
    'Carrot Cake': {
      descricao:
        'Bolo fofinho de cenoura com especiarias e cobertura cremosa de cream cheese. Um clássico aconchegante com sabor de casa e cheirinho de canela.',
      avaliacao: 4.7,
    },
  };

  // 📦 Volumes padrão
  volumeDefinido: any = {
    'Battenberg Cake': '250 g',
    'Blueberry & lemon friands': '300 g',
    'Fruit and Cream Cheese Breakfast Pastries': '200 g',
    'Carrot Cake': '350 g',
    'Apple Frangipan Tart': '400 g',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private carrinhoService: CarrinhoService
  ) {
    addIcons({ starOutline, cartOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.preco = this.route.snapshot.queryParamMap.get('preco');

    if (!id) {
      console.error('ID não encontrado!');
      this.voltar();
      return;
    }

    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    this.http.get(url).subscribe({
      next: (res: any) => {
        if (res.meals && res.meals.length > 0) {
          this.comida = res.meals[0];

          // 🍽️ Define tamanho padrão automaticamente
          const tamanhosPadrao: any = {
            'Apple Frangipan Tart': 'Médio',
            'Battenberg Cake': 'Pequeno',
            'Fruit and Cream Cheese Breakfast Pastries': 'Pequeno',
            'Blueberry & lemon friands': 'Grande',
            'Carrot Cake': 'Médio',
          };
          this.tamanhoSelecionado =
            tamanhosPadrao[this.comida.strMeal] || 'Médio';

          // ⚡ Define descrição e volume
          this.setDescricaoPersonalizada();
          this.setVolumeSelecionado();

          // Verifica se o item está no carrinho
          this.carrinhoService.getCarrinho().subscribe((itens) => {
            this.estaNoCarrinho = itens.some(
              (item) => item.id === parseInt(this.comida.idMeal)
            );
          });
        } else {
          this.voltar();
        }
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes da comida:', err);
        this.voltar();
      },
    });
  }

  // ✨ Define descrição personalizada
  setDescricaoPersonalizada() {
    const nome = this.comida?.strMeal;
    this.descricaoSelecionada = this.descricaoPersonalizada[nome] || null;
  }

  // 📦 Define volume se existir
  setVolumeSelecionado() {
    const nome = this.comida?.strMeal;
    this.volumeSelecionado = this.volumeDefinido[nome] || null;
  }

  // ⬅️ Voltar
  voltar() {
    this.location.back();
  }

  // 🧩 Selecionar tamanho (ao clicar)
  selecionarTamanho(tamanho: string) {
    this.tamanhoSelecionado = tamanho;
  }

  // 🛒 Adicionar ao carrinho
  adicionarAoCarrinho() {
    if (!this.comida || !this.preco) return;

    const itemId = parseInt(this.comida.idMeal);
    const comidaId = this.comida.idMeal;

    // Toggle: se já está no carrinho, remove; se não está, adiciona
    if (this.estaNoCarrinho) {
      this.carrinhoService.remover(itemId);
      this.estaNoCarrinho = false;
      
      // Remove dos favoritos
      const favoritosSalvos = localStorage.getItem('favoritosComidas');
      if (favoritosSalvos) {
        const favoritos = new Set(JSON.parse(favoritosSalvos));
        favoritos.delete(comidaId);
        localStorage.setItem('favoritosComidas', JSON.stringify(Array.from(favoritos)));
      }
    } else {
      const item: ItemCarrinho = {
        id: itemId,
        nome: this.comida.strMeal,
        preco: parseFloat(this.preco),
        quantidade: 1,
        imagem: this.comida.strMealThumb,
      };
      this.carrinhoService.adicionar(item);
      this.estaNoCarrinho = true;
      
      // Adiciona aos favoritos
      const favoritosSalvos = localStorage.getItem('favoritosComidas');
      const favoritos = favoritosSalvos ? new Set(JSON.parse(favoritosSalvos)) : new Set();
      favoritos.add(comidaId);
      localStorage.setItem('favoritosComidas', JSON.stringify(Array.from(favoritos)));
    }
  }
}
